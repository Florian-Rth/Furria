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
  it('derives one reason per answered thesis the group holds a stance on, strongest first', () => {
    const reasons = reasonsFor({ stage: 'yes', build: 'no', ritual: 'yes', 'age-band': 'old' });

    expect(reasons.map((reason) => reason.questionId)).toEqual(['build', 'stage']);
  });

  it('says what you answered and what the group answered', () => {
    expect(reasonsFor({ stage: 'neutral' })).toEqual([
      {
        questionId: 'stage',
        prompt: 'Ich will auf die Bühne.',
        agreement: 'partial',
        answer: 'neutral',
        stance: 'yes',
        importance: 1,
      },
    ]);
  });

  it.each([
    ['yes', 'agree'],
    ['no', 'disagree'],
  ])('classifies the answer %s to a yes-thesis as %s', (answer, agreement) => {
    expect(reasonsFor({ stage: answer })[0]?.agreement).toBe(agreement);
  });

  it.each<[string, MatcherAnswers]>([
    ['skipped', {}],
    ['unreadable', { stage: 'vielleicht' }],
  ])('stays silent about %s answers', (_, answers) => {
    expect(reasonsFor(answers)).toEqual([]);
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
