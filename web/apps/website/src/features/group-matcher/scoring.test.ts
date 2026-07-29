import { describe, expect, it } from 'vitest';
import type { GroupMatcher } from '@/lib/seed/group-matcher';
import { SEEDED_GROUP_MATCHER } from '@/lib/seed/group-matcher';
import type { Group } from '@/lib/seed/groups';
import type { MatcherAnswers } from './schemas';
import type { MatchOutcome } from './scoring';
import { agreementScore, rankGroups } from './scoring';

const buildGroup = (id: string): Group => ({
  id,
  name: id.toUpperCase(),
  ageRange: { from: 6, to: null },
  isRecruiting: true,
  tagline: 'Ergebniszeile',
});

const matcher: GroupMatcher = {
  groups: [buildGroup('alpha'), buildGroup('beta'), buildGroup('gamma')],
  questions: [
    {
      id: 'age-band',
      role: 'filter',
      prompt: 'Wie alt bist du?',
      options: [
        { id: 'young', label: 'unter 12' },
        { id: 'old', label: '12 oder älter' },
      ],
      positions: [
        { groupId: 'alpha', accepts: ['young', 'old'] },
        { groupId: 'beta', accepts: ['old'] },
        { groupId: 'gamma', accepts: ['young'] },
      ],
    },
    {
      id: 'stage',
      role: 'weighted',
      prompt: 'Ich will auf die Bühne.',
      positions: [
        { groupId: 'alpha', stance: 'yes', importance: 1 },
        { groupId: 'beta', stance: 'no', importance: 1 },
        { groupId: 'gamma', stance: 'neutral', importance: 1 },
      ],
    },
    {
      id: 'build',
      role: 'weighted',
      prompt: 'Ich packe beim Aufbau mit an.',
      positions: [
        { groupId: 'alpha', stance: 'yes', importance: 2 },
        { groupId: 'beta', stance: 'yes', importance: 2 },
        { groupId: 'gamma', stance: 'no', importance: 2 },
      ],
    },
  ],
};

const rank = (answers: MatcherAnswers): MatchOutcome => rankGroups(matcher, answers);

const percentageOf = (answers: MatcherAnswers, groupId: string): number | undefined => {
  const outcome = rank(answers);

  if (outcome.status !== 'ranked') {
    return undefined;
  }

  return outcome.matches.find((match) => match.group.id === groupId)?.percentage;
};

describe('agreementScore', () => {
  it('awards two points for the same stance', () => {
    expect(agreementScore('yes', 'yes')).toBe(2);
    expect(agreementScore('no', 'no')).toBe(2);
    expect(agreementScore('neutral', 'neutral')).toBe(2);
  });

  it('awards one point when exactly one side is neutral', () => {
    expect(agreementScore('yes', 'neutral')).toBe(1);
    expect(agreementScore('neutral', 'no')).toBe(1);
  });

  it('awards nothing for opposite stances', () => {
    expect(agreementScore('yes', 'no')).toBe(0);
    expect(agreementScore('no', 'yes')).toBe(0);
  });
});

describe('rankGroups', () => {
  it('normalises every Gruppe against its own possible points', () => {
    expect(percentageOf({ stage: 'yes' }, 'alpha')).toBe(100);
    expect(percentageOf({ stage: 'yes' }, 'gamma')).toBe(50);
    expect(percentageOf({ stage: 'yes' }, 'beta')).toBe(0);
  });

  it('weights a question by the importance the Gruppe gave it', () => {
    expect(percentageOf({ stage: 'yes', build: 'yes' }, 'beta')).toBe(67);
    expect(percentageOf({ stage: 'yes', build: 'yes' }, 'gamma')).toBe(17);
  });

  it('leaves both sums untouched for a skipped question', () => {
    expect(percentageOf({ stage: 'yes' }, 'beta')).toBe(0);
    expect(percentageOf({ build: 'yes' }, 'beta')).toBe(100);
  });

  it('treats an answer it cannot read as a skipped question', () => {
    expect(percentageOf({ stage: 'vielleicht', build: 'yes' }, 'beta')).toBe(100);
  });

  it('ranks the best match first', () => {
    const outcome = rank({ stage: 'yes', build: 'yes' });

    expect(outcome.status).toBe('ranked');
    if (outcome.status === 'ranked') {
      expect(outcome.matches.map((match) => match.group.id)).toEqual(['alpha', 'beta', 'gamma']);
    }
  });

  it('keeps tied Gruppen in roster order', () => {
    const outcome = rank({ build: 'yes' });

    expect(outcome.status).toBe('ranked');
    if (outcome.status === 'ranked') {
      expect(outcome.matches.map((match) => match.percentage)).toEqual([100, 100, 0]);
      expect(outcome.matches.map((match) => match.group.id)).toEqual(['alpha', 'beta', 'gamma']);
    }
  });

  it('excludes a Gruppe whose filter rejects the answer and names the reason', () => {
    const outcome = rank({ 'age-band': 'young', stage: 'yes' });

    expect(outcome.status).toBe('ranked');
    if (outcome.status === 'ranked') {
      expect(outcome.matches.map((match) => match.group.id)).toEqual(['alpha', 'gamma']);
      expect(outcome.excluded).toEqual([
        {
          group: matcher.groups[1],
          questionId: 'age-band',
          questionPrompt: 'Wie alt bist du?',
          answerLabel: 'unter 12',
        },
      ]);
    }
  });

  it('ignores a filter answer that is not one of the offered options', () => {
    const outcome = rank({ 'age-band': 'ancient', stage: 'yes' });

    expect(outcome.status).toBe('ranked');
    if (outcome.status === 'ranked') {
      expect(outcome.matches).toHaveLength(3);
      expect(outcome.excluded).toEqual([]);
    }
  });

  it('asks for an answer instead of dividing by zero', () => {
    expect(rank({}).status).toBe('unanswered');
  });

  it('asks for an answer when every scored question was skipped', () => {
    expect(rank({ 'age-band': 'old' }).status).toBe('unanswered');
  });

  it('reports an honest empty outcome when every Gruppe is filtered out', () => {
    const narrow: GroupMatcher = {
      ...matcher,
      groups: [matcher.groups[1]].flatMap((group) => (group === undefined ? [] : [group])),
    };
    const outcome = rankGroups(narrow, { 'age-band': 'young', stage: 'yes' });

    expect(outcome.status).toBe('no-matches');
    if (outcome.status === 'no-matches') {
      expect(outcome.excluded.map((exclusion) => exclusion.group.id)).toEqual(['beta']);
    }
  });

  it('keeps every score between zero and one', () => {
    const outcome = rank({ stage: 'no', build: 'neutral' });

    expect(outcome.status).toBe('ranked');
    if (outcome.status === 'ranked') {
      for (const match of outcome.matches) {
        expect(match.score).toBeGreaterThanOrEqual(0);
        expect(match.score).toBeLessThanOrEqual(1);
        expect(match.percentage).toBe(Math.round(match.score * 100));
      }
    }
  });
});

describe('the seeded questions', () => {
  const answerAll = (stance: string): MatcherAnswers =>
    Object.fromEntries(
      SEEDED_GROUP_MATCHER.questions.flatMap((question) =>
        question.role === 'weighted' ? [[question.id, stance]] : [],
      ),
    );

  const spreadOf = (answers: MatcherAnswers): number => {
    const outcome = rankGroups(SEEDED_GROUP_MATCHER, answers);

    if (outcome.status !== 'ranked') {
      return 0;
    }

    const percentages = outcome.matches.map((match) => match.percentage);

    return Math.max(...percentages) - Math.min(...percentages);
  };

  it('spreads the ranking instead of clustering every Gruppe on one number', () => {
    expect(spreadOf(answerAll('yes'))).toBeGreaterThanOrEqual(20);
    expect(spreadOf(answerAll('no'))).toBeGreaterThanOrEqual(20);
  });

  it('sends a Bühnen-Mensch and an Anpacker to different Gruppen', () => {
    const onStage = rankGroups(SEEDED_GROUP_MATCHER, {
      'age-band': '18-plus',
      stage: 'yes',
      choreography: 'yes',
      solo: 'no',
      uniform: 'yes',
      bursts: 'no',
      'build-day': 'no',
    });
    const backstage = rankGroups(SEEDED_GROUP_MATCHER, {
      'age-band': '18-plus',
      stage: 'no',
      choreography: 'no',
      solo: 'no',
      uniform: 'no',
      bursts: 'yes',
      'build-day': 'yes',
    });

    expect(onStage.status).toBe('ranked');
    expect(backstage.status).toBe('ranked');
    if (onStage.status === 'ranked' && backstage.status === 'ranked') {
      expect(onStage.matches[0]?.group.id).toBe('tanzgarde');
      expect(backstage.matches[0]?.group.id).toBe('organisation');
    }
  });

  it('never matches an adult to the Kindergarde', () => {
    const outcome = rankGroups(SEEDED_GROUP_MATCHER, { 'age-band': '18-plus', stage: 'yes' });

    expect(outcome.status).toBe('ranked');
    if (outcome.status === 'ranked') {
      expect(outcome.matches.map((match) => match.group.id)).not.toContain('kindergarde');
      expect(outcome.excluded.map((exclusion) => exclusion.group.id)).toContain('kindergarde');
    }
  });

  it('leaves a child with the Kindergarde and nothing else', () => {
    const outcome = rankGroups(SEEDED_GROUP_MATCHER, { 'age-band': 'under-12', stage: 'yes' });

    expect(outcome.status).toBe('ranked');
    if (outcome.status === 'ranked') {
      expect(outcome.matches.map((match) => match.group.id)).toEqual(['kindergarde']);
      expect(outcome.excluded).toHaveLength(5);
    }
  });
});
