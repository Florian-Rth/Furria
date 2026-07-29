import { describe, expect, it } from 'vitest';
import {
  countAnsweredQuestions,
  emptyKompassProgress,
  resolveProgressPercent,
  SKIPPED_ANSWER,
  startKompassProgress,
  withAnswer,
  withPreviousQuestion,
  withSkippedQuestion,
} from './kompass-progress';

const questionIds = ['age-band', 'stage', 'build'];

describe('startKompassProgress', () => {
  it('opens on the first question when nothing was answered yet', () => {
    expect(startKompassProgress(questionIds, {})).toEqual({ index: 0, answers: {} });
  });

  it('resumes on the first question that has no answer', () => {
    expect(startKompassProgress(questionIds, { 'age-band': '18-plus' })).toEqual({
      index: 1,
      answers: { 'age-band': '18-plus' },
    });
  });

  it('resumes past a question that was deliberately skipped', () => {
    const resumed = startKompassProgress(questionIds, {
      'age-band': SKIPPED_ANSWER,
      stage: 'yes',
    });

    expect(resumed.index).toBe(2);
  });

  it('is complete when every question carries an answer', () => {
    const answers = { 'age-band': '18-plus', stage: 'yes', build: 'no' };

    expect(startKompassProgress(questionIds, answers).index).toBe(3);
  });

  it('drops answers to questions the payload no longer asks', () => {
    expect(startKompassProgress(questionIds, { 'age-band': '18-plus', ancient: 'yes' })).toEqual({
      index: 1,
      answers: { 'age-band': '18-plus' },
    });
  });
});

describe('withAnswer', () => {
  it('records the answer to the current question and advances', () => {
    const progress = withAnswer(startKompassProgress(questionIds, {}), questionIds, '18-plus');

    expect(progress).toEqual({ index: 1, answers: { 'age-band': '18-plus' } });
  });

  it('replaces an earlier answer when the visitor comes back to the question', () => {
    const answered = withAnswer(startKompassProgress(questionIds, {}), questionIds, '18-plus');
    const revised = withAnswer(withPreviousQuestion(answered), questionIds, 'under-12');

    expect(revised).toEqual({ index: 1, answers: { 'age-band': 'under-12' } });
  });

  it('stays put once there is no question left to answer', () => {
    const complete = { index: 3, answers: {} };

    expect(withAnswer(complete, questionIds, 'yes')).toEqual(complete);
  });
});

describe('withSkippedQuestion', () => {
  it('marks the question as skipped and advances', () => {
    const progress = withSkippedQuestion(startKompassProgress(questionIds, {}), questionIds);

    expect(progress).toEqual({ index: 1, answers: { 'age-band': SKIPPED_ANSWER } });
  });

  it('records a skip the scoring cannot mistake for a stance or an option', () => {
    expect(SKIPPED_ANSWER).not.toBe('yes');
    expect(SKIPPED_ANSWER).not.toBe('neutral');
    expect(SKIPPED_ANSWER).not.toBe('no');
  });
});

describe('withPreviousQuestion', () => {
  it('steps back one question and keeps the answers', () => {
    const answered = withAnswer(startKompassProgress(questionIds, {}), questionIds, '18-plus');

    expect(withPreviousQuestion(answered)).toEqual({
      index: 0,
      answers: { 'age-band': '18-plus' },
    });
  });

  it('never steps in front of the first question', () => {
    expect(withPreviousQuestion({ index: 0, answers: {} })).toEqual({ index: 0, answers: {} });
  });

  it('steps back from the finished quiz to the last question', () => {
    expect(withPreviousQuestion({ index: 3, answers: {} }).index).toBe(2);
  });
});

describe('emptyKompassProgress', () => {
  it('forgets every answer and returns to the first question', () => {
    expect(emptyKompassProgress()).toEqual({ index: 0, answers: {} });
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
    expect(resolveProgressPercent({ index: 0, answers: {} }, questionIds)).toBe(0);
    expect(resolveProgressPercent({ index: 1, answers: {} }, questionIds)).toBe(33);
    expect(resolveProgressPercent({ index: 3, answers: {} }, questionIds)).toBe(100);
  });

  it('never divides by an empty question list', () => {
    expect(resolveProgressPercent({ index: 0, answers: {} }, [])).toBe(0);
  });
});
