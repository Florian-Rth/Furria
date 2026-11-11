import { describe, expect, it } from 'vitest';
import type { MatcherAnswers } from '@/features/group-matcher/schemas';
import type { GroupMatcher, MatcherGroup } from '@/features/group-matcher/types';
import type { MatcherRankingView, MatcherResultView } from './matcher-result';
import { selectMatcherResult } from './matcher-result';

const buildGroup = (id: number, isRecruiting: boolean): MatcherGroup => ({
  id,
  name: `G${id}`,
  isRecruiting,
  description: 'Ergebniszeile',
});

const matcher: GroupMatcher = {
  groups: [buildGroup(1, true), buildGroup(2, false), buildGroup(3, true), buildGroup(4, true)],
  questions: [
    {
      id: 'age-band',
      role: 'filter',
      prompt: 'Wie alt bist du?',
      options: [
        { id: 'underTwelve', label: 'unter 12' },
        { id: 'twelveToThirteen', label: '12 oder älter' },
        { id: 'eighteenPlus', label: '120 oder älter' },
      ],
      positions: [
        { groupId: 1, accepts: ['underTwelve', 'twelveToThirteen'] },
        { groupId: 2, accepts: ['twelveToThirteen'] },
        { groupId: 3, accepts: ['underTwelve'] },
        { groupId: 4, accepts: ['twelveToThirteen'] },
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
        { groupId: 4, stance: 'yes', importance: 1 },
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
        { groupId: 4, stance: 'no', importance: 2 },
      ],
    },
  ],
};

const answered: MatcherAnswers = { 'age-band': 'twelveToThirteen', stage: 'yes', build: 'yes' };

const resultFor = (answers: MatcherAnswers): MatcherResultView =>
  selectMatcherResult(matcher, answers);

const rankingFor = (answers: MatcherAnswers): MatcherRankingView => {
  const view = resultFor(answers);

  if (view.kind !== 'ranking') {
    throw new Error(`expected a ranking, got ${view.kind}`);
  }

  return view;
};

describe('selectMatcherResult', () => {
  it('ranks every eligible group with its percentage, best match on top', () => {
    const ranking = rankingFor(answered);

    expect(
      [ranking.top, ...ranking.rest].map((match) => [match.group.id, match.rank, match.percentage]),
    ).toEqual([
      [1, 1, 100],
      [2, 2, 67],
      [4, 3, 33],
    ]);
  });

  it('derives the why from the answers, strongest reason first', () => {
    const ranking = rankingFor(answered);

    expect(ranking.top.reasons.map((reason) => reason.questionId)).toEqual(['build', 'stage']);
  });

  it('lists every excluded group', () => {
    const ranking = rankingFor(answered);

    expect(ranking.excluded.map((exclusion) => exclusion.group.id)).toEqual([3]);
  });

  it.each<[string, MatcherAnswers]>([
    ['no answer', {}],
    ['only a filter answer', { 'age-band': 'twelveToThirteen' }],
  ])('asks for a weighted answer instead of ranking %s', (_, answers) => {
    expect(resultFor(answers).kind).toBe('unanswered');
  });

  it('stays honest when every group is filtered out', () => {
    const view = resultFor({ 'age-band': 'eighteenPlus', stage: 'yes' });

    if (view.kind !== 'empty') {
      throw new Error(`expected an empty result, got ${view.kind}`);
    }

    expect(view.excluded.map((exclusion) => exclusion.group.id)).toEqual([1, 2, 3, 4]);
  });
});
