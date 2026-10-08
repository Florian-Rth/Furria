import { describe, expect, it } from 'vitest';
import type { GroupMatcher } from '@/lib/seed/group-matcher';
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
  it.each([
    ['yes', 'yes', 2],
    ['neutral', 'neutral', 2],
    ['yes', 'neutral', 1],
    ['neutral', 'no', 1],
    ['yes', 'no', 0],
  ] as const)('scores the answer %s against the stance %s with %i', (answer, stance, score) => {
    expect(agreementScore(answer, stance)).toBe(score);
  });
});

describe('rankGroups', () => {
  it.each<[MatcherAnswers, string, number]>([
    [{ stage: 'yes' }, 'alpha', 100],
    [{ stage: 'yes' }, 'gamma', 50],
    [{ stage: 'yes' }, 'beta', 0],
    [{ stage: 'yes', build: 'yes' }, 'beta', 67],
    [{ stage: 'yes', build: 'yes' }, 'gamma', 17],
    [{ build: 'yes' }, 'beta', 100],
    [{ stage: 'vielleicht', build: 'yes' }, 'beta', 100],
  ])('scores the answers %j for %s with %i%', (answers, groupId, percentage) => {
    expect(percentageOf(answers, groupId)).toBe(percentage);
  });

  it.each<[MatcherAnswers, string[]]>([
    [{ stage: 'yes', build: 'yes' }, ['alpha', 'beta', 'gamma']],
    [{ build: 'yes' }, ['alpha', 'beta', 'gamma']],
  ])('ranks the answers %j best first, ties in roster order', (answers, order) => {
    const outcome = rank(answers);

    expect(outcome.status === 'ranked' && outcome.matches.map((match) => match.group.id)).toEqual(
      order,
    );
  });

  it('excludes a group whose filter rejects the answer and names the reason', () => {
    const outcome = rank({ 'age-band': 'young', stage: 'yes' });

    expect(outcome.status === 'ranked' && outcome.matches.map((match) => match.group.id)).toEqual([
      'alpha',
      'gamma',
    ]);
    expect(outcome.status === 'ranked' && outcome.excluded).toEqual([
      {
        group: matcher.groups[1],
        questionId: 'age-band',
        questionPrompt: 'Wie alt bist du?',
        answerLabel: 'unter 12',
      },
    ]);
  });

  it('ignores a filter answer that is not one of the offered options', () => {
    const outcome = rank({ 'age-band': 'ancient', stage: 'yes' });

    expect(outcome.status === 'ranked' && [outcome.matches.length, outcome.excluded]).toEqual([
      3,
      [],
    ]);
  });

  it.each<[string, MatcherAnswers]>([
    ['no answer', {}],
    ['only a filter answer', { 'age-band': 'old' }],
  ])('asks for an answer instead of dividing by zero after %s', (_, answers) => {
    expect(rank(answers).status).toBe('unanswered');
  });

  it('reports an honest empty outcome when every group is filtered out', () => {
    const narrow: GroupMatcher = {
      ...matcher,
      groups: [matcher.groups[1]].flatMap((group) => (group === undefined ? [] : [group])),
    };
    const outcome = rankGroups(narrow, { 'age-band': 'young', stage: 'yes' });

    expect(
      outcome.status === 'no-matches' && outcome.excluded.map((exclusion) => exclusion.group.id),
    ).toEqual(['beta']);
  });
});
