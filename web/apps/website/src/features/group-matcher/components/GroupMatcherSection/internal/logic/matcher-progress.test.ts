import { describe, expect, it } from 'vitest';
import type { MatcherProgress } from './matcher-progress';
import {
  countAnsweredQuestions,
  resolveProgressPercent,
  SKIPPED_ANSWER,
  startMatcherProgress,
  withAnswer,
  withPreviousQuestion,
} from './matcher-progress';

const questionIds = ['age-band', 'stage', 'build'];

describe('startMatcherProgress', () => {
  it.each<[string, Record<string, string>, number]>([
    ['nothing was answered yet', {}, 0],
    ['the first question has an answer', { 'age-band': '18-plus' }, 1],
    ['a question was deliberately skipped', { 'age-band': SKIPPED_ANSWER, stage: 'yes' }, 2],
    ['every question carries an answer', { 'age-band': '18-plus', stage: 'yes', build: 'no' }, 3],
  ])('resumes at the first unanswered question when %s', (_, answers, index) => {
    expect(startMatcherProgress(questionIds, answers).index).toBe(index);
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
    expect(withAnswer({ index: 0, answers: {}, finished: false }, questionIds, '18-plus')).toEqual({
      index: 1,
      answers: { 'age-band': '18-plus' },
      finished: false,
    });
  });

  it('stays put once there is no question left to answer', () => {
    const complete: MatcherProgress = { index: 3, answers: {}, finished: false };

    expect(withAnswer(complete, questionIds, 'yes')).toEqual(complete);
  });
});

describe('withPreviousQuestion', () => {
  it.each<[string, MatcherProgress, MatcherProgress]>([
    [
      'steps back one question',
      { index: 1, answers: { 'age-band': '18-plus' }, finished: false },
      { index: 0, answers: { 'age-band': '18-plus' }, finished: false },
    ],
    [
      'never steps in front of the first question',
      { index: 0, answers: {}, finished: false },
      { index: 0, answers: {}, finished: false },
    ],
    [
      'returns from an early result to the question the visitor left',
      { index: 1, answers: {}, finished: true },
      { index: 1, answers: {}, finished: false },
    ],
  ])('%s', (_, progress, previous) => {
    expect(withPreviousQuestion(progress)).toEqual(previous);
  });
});

describe('countAnsweredQuestions', () => {
  it('does not count a skipped question as answered', () => {
    expect(countAnsweredQuestions({ 'age-band': SKIPPED_ANSWER, stage: 'yes', build: 'no' })).toBe(
      2,
    );
  });
});

describe('resolveProgressPercent', () => {
  it.each<[number, string[], number]>([
    [1, questionIds, 33],
    [3, questionIds, 100],
    [0, [], 0],
  ])('fills the bar at question %i of %j to %i%', (index, ids, percent) => {
    expect(resolveProgressPercent({ index, answers: {}, finished: false }, ids)).toBe(percent);
  });
});
