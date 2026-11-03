import type { StudioPart, StudioStep } from '@furria/studio/studio-schemas';
import { deskPartOf, markSecondsOf, partBorderStepOf } from '@furria/studio/studio-steps';
import { describe, expect, it } from 'vitest';

const stepOf = (stepId: number, start: number | null, end: number | null): StudioStep => ({
  stepId,
  name: `Schritt ${stepId}`,
  description: null,
  startSeconds: start,
  endSeconds: end,
  placement: start === null ? 'cutAway' : 'onTimeline',
});

const partOf = (partId: number, stepIds: number[], adrift = false): StudioPart => ({
  partId,
  name: `Teil ${partId}`,
  stepIds,
  mainVideoId: null,
  adrift,
});

const steps = [stepOf(1, 0, 10), stepOf(2, 10, 20), stepOf(3, 20, 30), stepOf(4, 30, 40)];

describe('partBorderStepOf', () => {
  const parts = [partOf(10, [1]), partOf(20, [2, 3]), partOf(30, [4])];

  it.each([
    [20, 'later', 3],
    [20, 'earlier', null],
    [30, 'earlier', 3],
    [30, 'later', null],
    [10, 'later', null],
  ] as const)('moves the start of part %s %s', (partId, shift, expected) => {
    expect(partBorderStepOf(steps, parts, partId, shift)).toBe(expected);
  });
});

describe('deskPartOf', () => {
  const parts = [partOf(10, [1]), partOf(20, [2, 3]), partOf(30, [4])];

  it.each([
    ['the part of the step without an anchor', 2, null, 20],
    ['the anchored part on the anchored step', 2, { stepId: 2, partId: 10 }, 10],
    ['the part of the step once the step changes', 4, { stepId: 2, partId: 10 }, 30],
    ['the part of the step once the anchored part is gone', 2, { stepId: 2, partId: 99 }, 20],
  ] as const)('picks %s', (_, stepId, anchor, expected) => {
    expect(deskPartOf(parts, stepId, anchor)?.partId ?? null).toBe(expected);
  });
});

describe('markSecondsOf', () => {
  const countMarks = [
    { seconds: 9.5, count: 1 },
    { seconds: 10, count: 2 },
    { seconds: 10.5, count: 3 },
  ];

  it.each([
    [10.6, 10.5],
    [10.1, 10.5],
    [9.8, 9.5],
  ])('marks %s on the nearest free count', (seconds, expected) => {
    expect(markSecondsOf({ steps, countMarks }, seconds)).toBe(expected);
  });
});
