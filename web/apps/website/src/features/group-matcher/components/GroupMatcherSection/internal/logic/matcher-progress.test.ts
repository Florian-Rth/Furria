import { describe, expect, it } from 'vitest';
import {
  countAnsweredQuestions,
  emptyMatcherProgress,
  resolveProgressPercent,
  SKIPPED_ANSWER,
  startMatcherProgress,
  withAnswer,
  withFinishedQuestions,
  withPreviousQuestion,
  withSkippedQuestion,
} from './matcher-progress';

const questionIds = ['age-band', 'stage', 'build'];

describe('startMatcherProgress', () => {
  it('opens on the first question when nothing was answered yet', () => {
    expect(startMatcherProgress(questionIds, {})).toEqual({
      index: 0,
      answers: {},
      finished: false,
    });
  });

  it('resumes on the first question that has no answer', () => {
    expect(startMatcherProgress(questionIds, { 'age-band': '18-plus' })).toEqual({
      index: 1,
      answers: { 'age-band': '18-plus' },
      finished: false,
    });
  });

  it('resumes past a question that was deliberately skipped', () => {
    const resumed = startMatcherProgress(questionIds, {
      'age-band': SKIPPED_ANSWER,
      stage: 'yes',
    });

    expect(resumed.index).toBe(2);
  });

  it('is complete when every question carries an answer', () => {
    const answers = { 'age-band': '18-plus', stage: 'yes', build: 'no' };

    expect(startMatcherProgress(questionIds, answers).index).toBe(3);
  });

  it('drops answers to questions the payload no longer asks', () => {
    expect(startMatcherProgress(questionIds, { 'age-band': '18-plus', ancient: 'yes' })).toEqual({
      index: 1,
      answers: { 'age-band': '18-plus' },
      finished: false,
    });
  });
});

describe('withAnswer', () => {
  it('records the answer to the current question and advances', () => {
    const progress = withAnswer(startMatcherProgress(questionIds, {}), questionIds, '18-plus');

    expect(progress).toEqual({ index: 1, answers: { 'age-band': '18-plus' }, finished: false });
  });

  it('replaces an earlier answer when the visitor comes back to the question', () => {
    const answered = withAnswer(startMatcherProgress(questionIds, {}), questionIds, '18-plus');
    const revised = withAnswer(withPreviousQuestion(answered), questionIds, 'under-12');

    expect(revised).toEqual({ index: 1, answers: { 'age-band': 'under-12' }, finished: false });
  });

  it('stays put once there is no question left to answer', () => {
    const complete = { index: 3, answers: {}, finished: false };

    expect(withAnswer(complete, questionIds, 'yes')).toEqual(complete);
  });
});

describe('withSkippedQuestion', () => {
  it('marks the question as skipped and advances', () => {
    const progress = withSkippedQuestion(startMatcherProgress(questionIds, {}), questionIds);

    expect(progress).toEqual({
      index: 1,
      answers: { 'age-band': SKIPPED_ANSWER },
      finished: false,
    });
  });

  it('records a skip the scoring cannot mistake for a stance or an option', () => {
    expect(SKIPPED_ANSWER).not.toBe('yes');
    expect(SKIPPED_ANSWER).not.toBe('neutral');
    expect(SKIPPED_ANSWER).not.toBe('no');
  });
});

describe('withPreviousQuestion', () => {
  it('steps back one question and keeps the answers', () => {
    const answered = withAnswer(startMatcherProgress(questionIds, {}), questionIds, '18-plus');

    expect(withPreviousQuestion(answered)).toEqual({
      index: 0,
      answers: { 'age-band': '18-plus' },
      finished: false,
    });
  });

  it('never steps in front of the first question', () => {
    const first = { index: 0, answers: {}, finished: false };

    expect(withPreviousQuestion(first)).toEqual(first);
  });

  it('steps back from the finished quiz to the last question', () => {
    expect(withPreviousQuestion({ index: 3, answers: {}, finished: false }).index).toBe(2);
  });

  it('returns from an early result to the question the visitor left', () => {
    const early = withFinishedQuestions({
      index: 1,
      answers: { 'age-band': '18-plus' },
      finished: false,
    });

    expect(withPreviousQuestion(early)).toEqual({
      index: 1,
      answers: { 'age-band': '18-plus' },
      finished: false,
    });
  });
});

describe('withFinishedQuestions', () => {
  it('ends the quiz where the visitor stands, keeping every answer', () => {
    expect(withFinishedQuestions({ index: 2, answers: { stage: 'yes' }, finished: false })).toEqual(
      {
        index: 2,
        answers: { stage: 'yes' },
        finished: true,
      },
    );
  });
});

describe('emptyMatcherProgress', () => {
  it('forgets every answer and returns to the first question', () => {
    expect(emptyMatcherProgress()).toEqual({ index: 0, answers: {}, finished: false });
  });
});

describe('countAnsweredQuestions', () => {
  it('counts the answers the visitor actually gave', () => {
    expect(countAnsweredQuestions({ 'age-band': '18-plus', stage: 'yes' })).toBe(2);
  });

  it('does not count a skipped question as answered', () => {
    expect(countAnsweredQuestions({ 'age-band': SKIPPED_ANSWER, stage: 'yes' })).toBe(1);
  });
});

describe('resolveProgressPercent', () => {
  it('starts empty and fills question by question', () => {
    expect(resolveProgressPercent({ index: 0, answers: {}, finished: false }, questionIds)).toBe(0);
    expect(resolveProgressPercent({ index: 1, answers: {}, finished: false }, questionIds)).toBe(
      33,
    );
    expect(resolveProgressPercent({ index: 3, answers: {}, finished: false }, questionIds)).toBe(
      100,
    );
  });

  it('never divides by an empty question list', () => {
    expect(resolveProgressPercent({ index: 0, answers: {}, finished: false }, [])).toBe(0);
  });
});
