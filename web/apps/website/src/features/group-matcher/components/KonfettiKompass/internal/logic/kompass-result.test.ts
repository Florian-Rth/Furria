import { describe, expect, it } from 'vitest';
import type { MatcherAnswers } from '@/features/group-matcher/schemas';
import type { GroupMatcher } from '@/lib/seed/group-matcher';
import type { Group } from '@/lib/seed/groups';
import type { KompassRankingView, KompassResultView } from './kompass-result';
import { selectKompassResult } from './kompass-result';

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

const resultFor = (answers: MatcherAnswers): KompassResultView =>
  selectKompassResult(matcher, answers);

const rankingFor = (answers: MatcherAnswers): KompassRankingView => {
  const view = resultFor(answers);

  if (view.kind !== 'ranking') {
    throw new Error(`expected a ranking, got ${view.kind}`);
  }

  return view;
};

describe('selectKompassResult', () => {
  it('puts the best match first and keeps the rest behind it', () => {
    const ranking = rankingFor(answered);

    expect(ranking.top.group.id).toBe('alpha');
    expect(ranking.rest.map((match) => match.group.id)).toEqual(['beta', 'delta']);
  });

  it('numbers every eligible Gruppe and prints its percentage', () => {
    const ranking = rankingFor(answered);

    expect([ranking.top, ...ranking.rest].map((match) => [match.rank, match.percentage])).toEqual([
      [1, 100],
      [2, 67],
      [3, 33],
    ]);
  });

  it('leaves a Gruppe that is not looking for new people exactly where it scored', () => {
    const [second] = rankingFor(answered).rest;

    expect(second?.group.id).toBe('beta');
    expect(second?.badge.color).toBe('default');
    expect(second?.badge.note).toContain('Anfrage');
  });

  it('derives the why from the answers, strongest reason first', () => {
    const ranking = rankingFor(answered);

    expect(ranking.top.reasons.map((reason) => reason.questionId)).toEqual(['build', 'stage']);
  });

  it('names every excluded Gruppe with the answer that ruled it out', () => {
    const ranking = rankingFor(answered);

    expect(ranking.excluded).toHaveLength(1);
    expect(ranking.excluded[0]?.group.id).toBe('gamma');
    expect(ranking.excluded[0]?.reason).toContain('12 oder älter');
  });

  it('hands the Antrag the best Gruppen and says which ones', () => {
    const ranking = rankingFor(answered);

    expect(ranking.applyHref).toBe('/join/apply?groups=alpha,beta,delta');
    expect(ranking.handoffNote).toContain('ALPHA, BETA und DELTA');
  });

  it('asks for at least one answer instead of ranking nothing', () => {
    expect(resultFor({}).kind).toBe('unanswered');
    expect(resultFor({ 'age-band': 'old' }).kind).toBe('unanswered');
  });

  it('stays honest when every Gruppe is filtered out', () => {
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
    expect(view.excluded[0]?.reason).toContain('120 oder älter');
  });
});
