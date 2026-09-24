import { describe, expect, it } from 'vitest';
import type { MatcherQuestion } from '@/lib/seed/group-matcher';
import type { Group } from '@/lib/seed/groups';
import type { MatchReason } from './match-reasons';
import { buildMatchReasons } from './match-reasons';
import type { MatcherAnswers } from './schemas';

const group: Group = {
  id: 'alpha',
  name: 'ALPHA',
  ageRange: { from: 6, to: null },
  isRecruiting: true,
  tagline: 'Ergebniszeile',
};

const stageQuestion: MatcherQuestion = {
  id: 'stage',
  role: 'weighted',
  prompt: 'Ich will auf die Bühne.',
  positions: [{ groupId: 'alpha', stance: 'yes', importance: 1 }],
};

const questions: MatcherQuestion[] = [
  {
    id: 'age-band',
    role: 'filter',
    prompt: 'Wie alt bist du?',
    options: [
      { id: 'young', label: 'unter 12' },
      { id: 'old', label: '12 oder älter' },
    ],
    positions: [{ groupId: 'alpha', accepts: ['young', 'old'] }],
  },
  stageQuestion,
  {
    id: 'build',
    role: 'weighted',
    prompt: 'Ich packe beim Aufbau mit an.',
    positions: [{ groupId: 'alpha', stance: 'no', importance: 2 }],
  },
  {
    id: 'ritual',
    role: 'weighted',
    prompt: 'Orden gehören dazu.',
    positions: [{ groupId: 'beta', stance: 'yes', importance: 3 }],
  },
];

const reasonsFor = (answers: MatcherAnswers): MatchReason[] =>
  buildMatchReasons(group, questions, answers);

describe('buildMatchReasons', () => {
  it('derives one reason per answered thesis the group holds a stance on', () => {
    const reasons = reasonsFor({ stage: 'yes', build: 'no', ritual: 'yes', 'age-band': 'old' });

    expect(reasons.map((reason) => reason.questionId)).toEqual(['build', 'stage']);
  });

  it('says what you answered and what the group answered', () => {
    const [reason] = reasonsFor({ stage: 'neutral' });

    expect(reason).toEqual({
      questionId: 'stage',
      prompt: 'Ich will auf die Bühne.',
      agreement: 'partial',
      answer: 'neutral',
      stance: 'yes',
      importance: 1,
    });
  });

  it('classifies full agreement and plain disagreement', () => {
    expect(reasonsFor({ stage: 'yes' })[0]?.agreement).toBe('agree');
    expect(reasonsFor({ stage: 'no' })[0]?.agreement).toBe('disagree');
  });

  it('stays silent about skipped and unreadable answers', () => {
    expect(reasonsFor({})).toEqual([]);
    expect(reasonsFor({ stage: 'vielleicht' })).toEqual([]);
  });

  it('puts the strongest reason first', () => {
    const reasons = reasonsFor({ stage: 'yes', build: 'no' });

    expect(reasons.map((reason) => reason.questionId)).toEqual(['build', 'stage']);
  });

  it('keeps equally strong reasons in question order', () => {
    const twin: MatcherQuestion = { ...stageQuestion, id: 'stage-twin', prompt: 'Zwilling.' };
    const reasons = buildMatchReasons(group, [stageQuestion, twin], {
      stage: 'yes',
      'stage-twin': 'yes',
    });

    expect(reasons.map((reason) => reason.questionId)).toEqual(['stage', 'stage-twin']);
  });
});
