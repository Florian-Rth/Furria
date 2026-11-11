import { describe, expect, it } from 'vitest';
import type { GroupMatcher, MatcherGroup } from '@/features/group-matcher/types';
import type { MatcherAnswers } from './schemas';
import type { MatchOutcome } from './scoring';
import { agreementScore, rankGroups } from './scoring';

const buildGroup = (id: number): MatcherGroup => ({
  id,
  name: `G${id}`,
  isRecruiting: true,
  description: 'Ergebniszeile',
});

const matcher: GroupMatcher = {
  groups: [buildGroup(1), buildGroup(2), buildGroup(3)],
  questions: [
    {
      id: 'age-band',
      role: 'filter',
      prompt: 'Wie alt bist du?',
      options: [
        { id: 'underTwelve', label: 'unter 12' },
        { id: 'twelveToThirteen', label: '12 oder älter' },
      ],
      positions: [
        { groupId: 1, accepts: ['underTwelve', 'twelveToThirteen'] },
        { groupId: 2, accepts: ['twelveToThirteen'] },
        { groupId: 3, accepts: ['underTwelve'] },
      ],
    },
    {
      id: 'stage',
      role: 'weighted',
      prompt: 'Ich will auf die Bühne.',
      positions: [
        { groupId: 1, stance: 'yes', importance: 1 },
        { groupId: 2, stance: 'no', importance: 1 },
        { groupId: 3, stance: 'neutral', importance: 1 },
      ],
    },
    {
      id: 'build',
      role: 'weighted',
      prompt: 'Ich packe beim Aufbau mit an.',
      positions: [
        { groupId: 1, stance: 'yes', importance: 2 },
        { groupId: 2, stance: 'yes', importance: 2 },
        { groupId: 3, stance: 'no', importance: 2 },
      ],
    },
  ],
};

const rank = (answers: MatcherAnswers): MatchOutcome => rankGroups(matcher, answers);

const percentageOf = (answers: MatcherAnswers, groupId: number): number | undefined => {
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
  it.each<[MatcherAnswers, number, number]>([
    [{ stage: 'yes' }, 1, 100],
    [{ stage: 'yes' }, 3, 50],
    [{ stage: 'yes' }, 2, 0],
    [{ stage: 'yes', build: 'yes' }, 2, 67],
    [{ stage: 'yes', build: 'yes' }, 3, 17],
    [{ build: 'yes' }, 2, 100],
    [{ stage: 'vielleicht', build: 'yes' }, 2, 100],
  ])('scores the answers %j for %s with %i%', (answers, groupId, percentage) => {
    expect(percentageOf(answers, groupId)).toBe(percentage);
  });

  it('skips a statement for a group that has no stance on it', () => {
    const joinedEarlier: GroupMatcher = {
      ...matcher,
      questions: [
        ...matcher.questions,
        {
          id: 'later',
          role: 'weighted',
          prompt: 'Später aufgenommen.',
          positions: [{ groupId: 2, stance: 'no', importance: 3 }],
        },
      ],
    };

    const outcome = rankGroups(joinedEarlier, { stage: 'yes', later: 'yes' });

    expect(
      outcome.status === 'ranked' &&
        outcome.matches.map((match) => [match.group.id, match.percentage]),
    ).toEqual([
      [1, 100],
      [3, 50],
      [2, 0],
    ]);
  });

  it.each<[MatcherAnswers, number[]]>([
    [{ stage: 'yes', build: 'yes' }, [1, 2, 3]],
    [{ build: 'yes' }, [1, 2, 3]],
  ])('ranks the answers %j best first, ties in roster order', (answers, order) => {
    const outcome = rank(answers);

    expect(outcome.status === 'ranked' && outcome.matches.map((match) => match.group.id)).toEqual(
      order,
    );
  });

  it('excludes a group whose filter rejects the answer and names the reason', () => {
    const outcome = rank({ 'age-band': 'underTwelve', stage: 'yes' });

    expect(outcome.status === 'ranked' && outcome.matches.map((match) => match.group.id)).toEqual([
      1, 3,
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
    const outcome = rank({ 'age-band': 'eighteenPlus', stage: 'yes' });

    expect(outcome.status === 'ranked' && [outcome.matches.length, outcome.excluded]).toEqual([
      3,
      [],
    ]);
  });

  it.each<[string, MatcherAnswers]>([
    ['no answer', {}],
    ['only a filter answer', { 'age-band': 'twelveToThirteen' }],
  ])('asks for an answer instead of dividing by zero after %s', (_, answers) => {
    expect(rank(answers).status).toBe('unanswered');
  });

  it('reports an honest empty outcome when every group is filtered out', () => {
    const narrow: GroupMatcher = {
      ...matcher,
      groups: [matcher.groups[1]].flatMap((group) => (group === undefined ? [] : [group])),
    };
    const outcome = rankGroups(narrow, { 'age-band': 'underTwelve', stage: 'yes' });

    expect(
      outcome.status === 'no-matches' && outcome.excluded.map((exclusion) => exclusion.group.id),
    ).toEqual([2]);
  });
});
