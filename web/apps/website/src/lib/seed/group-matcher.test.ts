import { describe, expect, it } from 'vitest';
import { GroupMatcherSchema, SEEDED_GROUP_MATCHER } from './group-matcher';
import { SEEDED_GROUPS } from './groups';

const seededGroup = {
  id: 'tanzgarde',
  name: 'Tanzgarde',
  ageRange: { from: 12, to: null },
  isRecruiting: true,
  tagline: 'Tanzen in Uniform.',
};

const weightedQuestion = {
  id: 'stage',
  role: 'weighted',
  prompt: 'Ich will auf die Bühne.',
  positions: [{ groupId: 'tanzgarde', stance: 'yes', importance: 3 }],
};

const filterQuestion = {
  id: 'age-band',
  role: 'filter',
  prompt: 'Wie alt bist du?',
  options: [
    { id: 'under-12', label: 'unter 12' },
    { id: '12-plus', label: '12 oder älter' },
  ],
  positions: [{ groupId: 'tanzgarde', accepts: ['12-plus'] }],
};

const payload = { groups: [seededGroup], questions: [filterQuestion, weightedQuestion] };

const questionIds = SEEDED_GROUP_MATCHER.questions.map((question) => question.id);

const filterQuestions = SEEDED_GROUP_MATCHER.questions.flatMap((question) =>
  question.role === 'filter' ? [question] : [],
);

const weightedQuestions = SEEDED_GROUP_MATCHER.questions.flatMap((question) =>
  question.role === 'weighted' ? [question] : [],
);

describe('GroupMatcherSchema', () => {
  it('parses a payload carrying both question roles', () => {
    expect(GroupMatcherSchema.parse(payload)).toEqual(payload);
  });

  it('drops fields the future endpoint may add', () => {
    const extended = {
      ...payload,
      questions: [{ ...weightedQuestion, hint: 'ganz ehrlich' }],
    };

    expect(GroupMatcherSchema.parse(extended).questions).toEqual([weightedQuestion]);
  });

  it('rejects an importance outside one to three, because the weight is the whole scale', () => {
    const tooHeavy = {
      ...payload,
      questions: [
        { ...weightedQuestion, positions: [{ groupId: 'a', stance: 'no', importance: 4 }] },
      ],
    };
    const weightless = {
      ...payload,
      questions: [
        { ...weightedQuestion, positions: [{ groupId: 'a', stance: 'no', importance: 0 }] },
      ],
    };

    expect(() => GroupMatcherSchema.parse(tooHeavy)).toThrow();
    expect(() => GroupMatcherSchema.parse(weightless)).toThrow();
  });

  it('rejects a stance outside ja, neutral and nein', () => {
    const shrug = {
      ...payload,
      questions: [
        { ...weightedQuestion, positions: [{ groupId: 'a', stance: 'maybe', importance: 2 }] },
      ],
    };

    expect(() => GroupMatcherSchema.parse(shrug)).toThrow();
  });

  it('rejects an unknown question role', () => {
    const invented = { ...payload, questions: [{ ...weightedQuestion, role: 'bonus' }] };

    expect(() => GroupMatcherSchema.parse(invented)).toThrow();
  });

  it('rejects a filter question with a single option, since one option filters nothing', () => {
    const single = {
      ...payload,
      questions: [{ ...filterQuestion, options: [{ id: 'under-12', label: 'unter 12' }] }],
    };

    expect(() => GroupMatcherSchema.parse(single)).toThrow();
  });

  it('rejects a filter position that accepts nothing, since it could never match', () => {
    const acceptsNothing = {
      ...payload,
      questions: [{ ...filterQuestion, positions: [{ groupId: 'tanzgarde', accepts: [] }] }],
    };

    expect(() => GroupMatcherSchema.parse(acceptsNothing)).toThrow();
  });

  it('rejects a question without positions and a payload without questions', () => {
    const withoutPositions = { ...payload, questions: [{ ...weightedQuestion, positions: [] }] };

    expect(() => GroupMatcherSchema.parse(withoutPositions)).toThrow();
    expect(() => GroupMatcherSchema.parse({ ...payload, questions: [] })).toThrow();
  });
});

describe('SEEDED_GROUP_MATCHER', () => {
  it('asks eleven questions, because eleven is the club number', () => {
    expect(SEEDED_GROUP_MATCHER.questions).toHaveLength(11);
  });

  it('carries the six real Gruppen in roster order', () => {
    expect(SEEDED_GROUP_MATCHER.groups).toEqual(SEEDED_GROUPS);
  });

  it('opens with the age filter, so an impossible match is ruled out first', () => {
    const [first] = SEEDED_GROUP_MATCHER.questions;

    expect(first?.role).toBe('filter');
    expect(first?.prompt).toContain('alt');
  });

  it('gives every question a unique kebab-case id', () => {
    expect(new Set(questionIds).size).toBe(questionIds.length);
    for (const id of questionIds) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  it('asks every question only once', () => {
    const prompts = SEEDED_GROUP_MATCHER.questions.map((question) => question.prompt);

    expect(new Set(prompts).size).toBe(prompts.length);
  });

  it('states a position for every Gruppe on every question', () => {
    const rosterIds = SEEDED_GROUPS.map((group) => group.id);

    for (const question of SEEDED_GROUP_MATCHER.questions) {
      const positionIds = question.positions.map((position) => position.groupId);

      expect(new Set(positionIds).size).toBe(positionIds.length);
      expect(positionIds.toSorted()).toEqual(rosterIds.toSorted());
    }
  });

  it('splits the roster on every weighted thesis, or the ranking would be flat', () => {
    for (const question of weightedQuestions) {
      const stances = new Set(question.positions.map((position) => position.stance));

      expect(stances.size, question.id).toBeGreaterThan(1);
    }
  });

  it('leaves no age band empty, since every visitor must get an answer', () => {
    for (const question of filterQuestions) {
      for (const option of question.options) {
        const accepting = question.positions.filter((position) =>
          position.accepts.includes(option.id),
        );

        expect(accepting.length, option.id).toBeGreaterThan(0);
      }
    }
  });

  it('never accepts an option a filter question does not offer', () => {
    for (const question of filterQuestions) {
      const optionIds = question.options.map((option) => option.id);

      for (const position of question.positions) {
        for (const accepted of position.accepts) {
          expect(optionIds).toContain(accepted);
        }
      }
    }
  });

  it('excludes the Kindergarde from every band an eleven-year-old has outgrown', () => {
    const ageQuestion = filterQuestions[0];
    const kindergarde = ageQuestion?.positions.find(
      (position) => position.groupId === 'kindergarde',
    );

    expect(kindergarde?.accepts).toEqual(['under-12']);
  });

  it('keeps every prompt short enough to read on a phone', () => {
    for (const question of SEEDED_GROUP_MATCHER.questions) {
      expect(question.prompt.length, question.id).toBeLessThanOrEqual(120);
    }
  });

  it('never promises drop-in trainings, training times or free spots', () => {
    const wording = SEEDED_GROUP_MATCHER.questions
      .map((question) => question.prompt)
      .join(' ')
      .toLowerCase();

    expect(wording).not.toContain('vorbeikommen');
    expect(wording).not.toContain('training');
    expect(wording).not.toContain('plätze frei');
  });
});
