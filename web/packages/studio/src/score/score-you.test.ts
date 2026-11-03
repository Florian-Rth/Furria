import type { ScoreStep } from '@furria/studio/score-steps';
import { paneStepIdOf, rememberedStepOf } from '@furria/studio/score-you';
import { describe, expect, it } from 'vitest';

const step = (stepId: number, timed: boolean): ScoreStep => ({
  stepId,
  number: stepId,
  name: '',
  description: null,
  range: timed ? { start: stepId, end: stepId + 1 } : null,
  partId: null,
  partIndex: null,
  counts: null,
  movement: false,
  video: null,
  flag: null,
});

describe('rememberedStepOf', () => {
  it.each([
    ['2', 2],
    ['3', null],
    ['9', null],
    [null, null],
    ['x', null],
  ])('resolves stored %s to step %s', (stored, expected) => {
    expect(rememberedStepOf([step(2, true), step(3, false)], stored)?.stepId ?? null).toBe(
      expected,
    );
  });
});

describe('paneStepIdOf', () => {
  it.each([
    [4, 7, 1, 4],
    [null, 7, 1, 7],
    [null, null, 1, 1],
    [null, null, null, null],
  ])('picked %s, playing %s, first %s shows %s', (picked, playing, fallback, expected) => {
    expect(paneStepIdOf(picked, playing, fallback)).toBe(expected);
  });
});
