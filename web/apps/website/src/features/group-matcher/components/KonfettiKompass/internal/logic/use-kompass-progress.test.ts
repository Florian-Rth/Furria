import { describe, expect, it } from 'vitest';
import { SEEDED_GROUP_MATCHER } from '@/lib/seed/group-matcher';
import { SKIPPED_ANSWER } from './kompass-progress';
import { selectKompassStepView, selectQuestionIds } from './use-kompass-progress';

const questionIds = selectQuestionIds(SEEDED_GROUP_MATCHER);
const total = questionIds.length;

const answersFor = (count: number, answer: string): Record<string, string> =>
  Object.fromEntries(questionIds.slice(0, count).map((questionId) => [questionId, answer]));

describe('selectQuestionIds', () => {
  it('lists the questions in the order they are asked', () => {
    expect(questionIds).toEqual(SEEDED_GROUP_MATCHER.questions.map((question) => question.id));
  });
});

describe('selectKompassStepView', () => {
  it('shows the first question with no way back', () => {
    const view = selectKompassStepView(SEEDED_GROUP_MATCHER, { index: 0, answers: {} });

    expect(view).toMatchObject({
      step: { kind: 'question', question: SEEDED_GROUP_MATCHER.questions[0], backDisabled: true },
      progressLabel: `Frage 1 von ${total}`,
      percent: 0,
    });
  });

  it('lets the visitor step back once past the first question', () => {
    const view = selectKompassStepView(SEEDED_GROUP_MATCHER, { index: 1, answers: {} });

    expect(view.step).toMatchObject({ kind: 'question', backDisabled: false });
    expect(view.progressLabel).toBe(`Frage 2 von ${total}`);
  });

  it('closes with a full bar and counts the answers it got', () => {
    const view = selectKompassStepView(SEEDED_GROUP_MATCHER, {
      index: total,
      answers: answersFor(total, 'yes'),
    });

    expect(view).toEqual({
      step: { kind: 'done', summary: `Du hast ${total} von ${total} Fragen beantwortet.` },
      progressLabel: 'Alle Fragen durch',
      percent: 100,
    });
  });

  it('says so plainly when every question was skipped', () => {
    const view = selectKompassStepView(SEEDED_GROUP_MATCHER, {
      index: total,
      answers: answersFor(total, SKIPPED_ANSWER),
    });

    expect(view.step).toEqual({ kind: 'done', summary: 'Du hast jede Frage übersprungen.' });
  });
});
