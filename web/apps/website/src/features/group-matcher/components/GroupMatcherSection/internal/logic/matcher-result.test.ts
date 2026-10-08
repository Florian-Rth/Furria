import { describe, expect, it } from 'vitest';
import type { MatcherAnswers } from '@/features/group-matcher/schemas';
import type { GroupMatcher } from '@/lib/seed/group-matcher';
import type { Group } from '@/lib/seed/groups';
import type { MatcherRankingView, MatcherResultView } from './matcher-result';
import { selectMatcherResult } from './matcher-result';

const buildGroup = (id: string, isRecruiting: boolean): Group => ({
  id,
  name: id.toUpperCase(),
  ageRange: { from: 6, to: null },
  isRecruiting,
  tagline: 'Ergebniszeile',
});

const matcher: GroupMatcher = {
  groups: [
    buildGroup('alpha', true),
    buildGroup('beta', false),
    buildGroup('gamma', true),
    buildGroup('delta', true),
  ],
  questions: [
    {
      id: 'age-band',
      role: 'filter',
      prompt: 'Wie alt bist du?',
      options: [
        { id: 'young', label: 'unter 12' },
        { id: 'old', label: '12 oder älter' },
        { id: 'ancient', label: '120 oder älter' },
      ],
      positions: [
        { groupId: 'alpha', accepts: ['young', 'old'] },
        { groupId: 'beta', accepts: ['old'] },
        { groupId: 'gamma', accepts: ['young'] },
        { groupId: 'delta', accepts: ['old'] },
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
        { groupId: 'delta', stance: 'yes', importance: 1 },
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
        { groupId: 'delta', stance: 'no', importance: 2 },
      ],
    },
  ],
};

const answered: MatcherAnswers = { 'age-band': 'old', stage: 'yes', build: 'yes' };

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
      ['alpha', 1, 100],
      ['beta', 2, 67],
      ['delta', 3, 33],
    ]);
  });

  it('derives the why from the answers, strongest reason first', () => {
    const ranking = rankingFor(answered);

    expect(ranking.top.reasons.map((reason) => reason.questionId)).toEqual(['build', 'stage']);
  });

  it('lists every excluded group', () => {
    const ranking = rankingFor(answered);

    expect(ranking.excluded.map((exclusion) => exclusion.group.id)).toEqual(['gamma']);
  });

  it.each<[string, MatcherAnswers]>([
    ['no answer', {}],
    ['only a filter answer', { 'age-band': 'old' }],
  ])('asks for a weighted answer instead of ranking %s', (_, answers) => {
    expect(resultFor(answers).kind).toBe('unanswered');
  });

  it('stays honest when every group is filtered out', () => {
    const view = resultFor({ 'age-band': 'ancient', stage: 'yes' });

    if (view.kind !== 'empty') {
      throw new Error(`expected an empty result, got ${view.kind}`);
    }

    expect(view.excluded.map((exclusion) => exclusion.group.id)).toEqual([
      'alpha',
      'beta',
      'gamma',
      'delta',
    ]);
  });
});
