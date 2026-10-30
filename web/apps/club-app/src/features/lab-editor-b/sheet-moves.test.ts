import { describe, expect, it } from 'vitest';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';
import { deskKeyOf, partFirstStepAt } from './sheet-moves';

const stepAt = (stepId: number, startSeconds: number): StudioStep => ({
  stepId,
  name: `S${stepId}`,
  description: null,
  startSeconds,
  endSeconds: startSeconds + 4,
  placement: 'onTimeline',
});

const steps = [stepAt(1, 0), stepAt(2, 4), stepAt(3, 8), stepAt(4, 12), stepAt(5, 16)];

const partOf = (partId: number, stepIds: number[]): StudioPart => ({
  partId,
  name: `T${partId}`,
  stepIds,
  mainVideoId: null,
  adrift: false,
});

const parts = [partOf(1, [1, 2]), partOf(2, [3, 4]), partOf(3, [5])];

describe('partFirstStepAt', () => {
  it.each([
    [6, 2],
    [9, 3],
    [13, 4],
    [17, 4],
    [0, 2],
  ])('moves the second part to the step at %s seconds', (seconds, stepId) => {
    expect(partFirstStepAt(steps, parts, 2, seconds)).toBe(stepId);
  });

  it('never moves the first part', () => {
    expect(partFirstStepAt(steps, parts, 1, 9)).toBeNull();
  });
});

describe('deskKeyOf', () => {
  const press = {
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    typing: false,
    control: false,
  };

  it.each([
    [' ', false, 'toggle'],
    ['ArrowLeft', false, 'stepBack'],
    ['ArrowLeft', true, 'countBack'],
    ['ArrowRight', false, 'stepForward'],
    ['ArrowRight', true, 'countForward'],
    ['+', false, 'zoomIn'],
    ['-', false, 'zoomOut'],
    ['a', false, null],
  ] as const)('reads %s (shift %s) as %s', (key, shiftKey, action) => {
    expect(deskKeyOf({ ...press, key, shiftKey })).toBe(action);
  });

  it('ignores keys while typing or with a modifier', () => {
    expect(deskKeyOf({ ...press, key: ' ', typing: true })).toBeNull();
    expect(deskKeyOf({ ...press, key: 'ArrowLeft', ctrlKey: true })).toBeNull();
  });

  it('leaves keys to a focused button or slider', () => {
    expect(deskKeyOf({ ...press, key: ' ', control: true })).toBeNull();
    expect(deskKeyOf({ ...press, key: 'ArrowRight', control: true })).toBeNull();
  });
});
