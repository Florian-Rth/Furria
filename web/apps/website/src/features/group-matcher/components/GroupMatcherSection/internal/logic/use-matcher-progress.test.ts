import { describe, expect, it } from 'vitest';
import { SEEDED_GROUP_MATCHER } from '@/lib/seed/group-matcher';
import { SKIPPED_ANSWER } from './matcher-progress';
import { selectMatcherStepView, selectQuestionIds } from './use-matcher-progress';

const questionIds = selectQuestionIds(SEEDED_GROUP_MATCHER);
const total = questionIds.length;

const answersFor = (count: number, answer: string): Record<string, string> =>
  Object.fromEntries(questionIds.slice(0, count).map((questionId) => [questionId, answer]));

describe('selectQuestionIds', () => {
  it('lists the questions in the order they are asked', () => {
    expect(questionIds).toEqual(SEEDED_GROUP_MATCHER.questions.map((question) => question.id));
  });
});

describe('selectMatcherStepView', () => {
  it('shows the first question with no way back and no result to ask for', () => {
    const view = selectMatcherStepView(SEEDED_GROUP_MATCHER, {
      index: 0,
      answers: {},
      finished: false,
    });

    expect(view).toMatchObject({
      step: {
        kind: 'question',
        question: SEEDED_GROUP_MATCHER.questions[0],
        backDisabled: true,
        finishDisabled: true,
      },
      progressLabel: `Frage 1 von ${total}`,
      percent: 0,
    });
  });

  it('lets the visitor step back and ask for the result once an answer is in', () => {
    const view = selectMatcherStepView(SEEDED_GROUP_MATCHER, {
      index: 1,
      answers: answersFor(1, '18-plus'),
      finished: false,
    });

    expect(view.step).toMatchObject({
      kind: 'question',
      backDisabled: false,
      finishDisabled: false,
    });
    expect(view.progressLabel).toBe(`Frage 2 von ${total}`);
  });

  it('keeps the result out of reach while every question so far was skipped', () => {
    const view = selectMatcherStepView(SEEDED_GROUP_MATCHER, {
      index: 1,
      answers: answersFor(1, SKIPPED_ANSWER),
      finished: false,
    });

    expect(view.step).toMatchObject({ kind: 'question', finishDisabled: true });
  });

  it('closes on the result with a full bar and counts the answers it got', () => {
    const view = selectMatcherStepView(SEEDED_GROUP_MATCHER, {
      index: total,
      answers: answersFor(total, 'yes'),
      finished: false,
    });

    expect(view.step).toMatchObject({
      kind: 'result',
      summary: `Du hast ${total} von ${total} Fragen beantwortet.`,
    });
    expect(view.progressLabel).toBe('Alle Fragen durch');
    expect(view.percent).toBe(100);
  });

  it('shows the result the moment the visitor asks for it, mid-quiz', () => {
    const view = selectMatcherStepView(SEEDED_GROUP_MATCHER, {
      index: 2,
      answers: answersFor(2, 'yes'),
      finished: true,
    });

    expect(view.step.kind).toBe('result');
  });

  it('asks for an answer when every question was skipped', () => {
    const view = selectMatcherStepView(SEEDED_GROUP_MATCHER, {
      index: total,
      answers: answersFor(total, SKIPPED_ANSWER),
      finished: false,
    });

    expect(view.step).toMatchObject({
      kind: 'result',
      summary: 'Du hast jede Frage übersprungen.',
      view: { kind: 'unanswered' },
    });
  });
});
