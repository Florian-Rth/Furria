import { describe, expect, it } from 'vitest';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';
import {
  followedStepIndexOf,
  nearestRateOf,
  neighbourIndexOf,
  opensPartAt,
  rateIdOf,
  rateOfId,
  segmentStateOf,
  shownViewOf,
  stepFillOf,
  stepNumberOf,
  turnOf,
} from './studio-f-lesson';

const step = (
  stepId: number,
  startSeconds: number | null,
  endSeconds: number | null,
): StudioStep => ({
  stepId,
  name: `Schritt ${stepId}`,
  description: null,
  startSeconds,
  endSeconds,
  placement: 'onTimeline',
});

const steps = [step(1, 2, 10), step(2, 10, 18), step(3, 20, 30)];

describe('followedStepIndexOf', () => {
  it.each([
    [0, 0],
    [2, 0],
    [9.9, 0],
    [10, 1],
    [19, 1],
    [25, 2],
    [400, 2],
  ])('at %s s follows step index %s', (seconds, expected) => {
    expect(followedStepIndexOf(steps, seconds)).toBe(expected);
  });

  it('reports no step when the dance has none', () => {
    expect(followedStepIndexOf([], 5)).toBe(-1);
  });
});

describe('neighbourIndexOf', () => {
  it.each([
    [0, 3, -1, null],
    [0, 3, 1, 1],
    [2, 3, 1, null],
    [2, 3, -1, 1],
    [0, 0, 1, null],
  ])('from %s of %s by %s lands on %s', (index, count, delta, expected) => {
    expect(neighbourIndexOf(index, count, delta)).toBe(expected);
  });
});

describe('turnOf', () => {
  it.each([
    [0, 1, 'forward'],
    [3, 1, 'back'],
    [2, 2, 'forward'],
  ])('from %s to %s turns %s', (from, to, expected) => {
    expect(turnOf(from, to)).toBe(expected);
  });
});

describe('stepFillOf', () => {
  it.each([
    [step(1, 10, 20), 5, 0],
    [step(1, 10, 20), 15, 0.5],
    [step(1, 10, 20), 25, 1],
    [step(1, 10, 10), 10, 0],
    [step(1, null, 20), 15, 0],
    [null, 15, 0],
  ])('fills %o at %s s to %s', (candidate, seconds, expected) => {
    expect(stepFillOf(candidate, seconds)).toBe(expected);
  });
});

describe('segmentStateOf', () => {
  it.each([
    [0, 2, 'done'],
    [2, 2, 'current'],
    [3, 2, 'ahead'],
  ])('segment %s with current %s is %s', (index, current, expected) => {
    expect(segmentStateOf(index, current)).toBe(expected);
  });
});

describe('shownViewOf', () => {
  it.each([
    ['video', true, 'video'],
    ['video', false, 'stage'],
    ['stage', true, 'stage'],
    ['stage', false, 'stage'],
  ] as const)('chosen %s with video %s shows %s', (chosen, hasVideo, expected) => {
    expect(shownViewOf(chosen, hasVideo)).toBe(expected);
  });
});

describe('rates', () => {
  it.each([
    [0.5, '50'],
    [0.75, '75'],
    [1, '100'],
  ])('rate %s has id %s and back', (rate, id) => {
    expect(rateIdOf(rate)).toBe(id);
    expect(rateOfId(id)).toBe(rate);
  });

  it('falls back to full speed for an unknown id', () => {
    expect(rateOfId('42')).toBe(1);
  });

  it.each([
    [0.55, 0.5],
    [0.7, 0.75],
    [0.95, 1],
  ])('rate %s snaps to %s', (rate, expected) => {
    expect(nearestRateOf(rate)).toBe(expected);
  });
});

describe('stepNumberOf', () => {
  it.each([
    [0, '01'],
    [11, '12'],
  ])('index %s reads %s', (index, expected) => {
    expect(stepNumberOf(index)).toBe(expected);
  });
});

describe('opensPartAt', () => {
  const part = (partId: number, stepIds: number[]): StudioPart => ({
    partId,
    name: `Teil ${partId}`,
    stepIds,
    mainVideoId: null,
    adrift: false,
  });
  const parts = [part(1, [1, 2]), part(2, [3])];

  it.each([
    [0, false],
    [1, false],
    [2, true],
    [3, false],
  ])('step index %s opens a part: %s', (index, expected) => {
    expect(opensPartAt(steps, parts, index)).toBe(expected);
  });
});
