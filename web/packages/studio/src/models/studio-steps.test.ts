import type { StudioPart, StudioStep } from '@furria/studio/studio-schemas';
import { deskPartOf, markSecondsOf, newPartOf, partShiftOf } from '@furria/studio/studio-steps';
import { describe, expect, it } from 'vitest';

const stepOf = (stepId: number, start: number | null, end: number | null): StudioStep => ({
  stepId,
  name: `Schritt ${stepId}`,
  startSeconds: start,
  endSeconds: end,
  placement: start === null ? 'cutAway' : 'onTimeline',
});

const partOf = (partId: number, stepIds: number[], adrift = false): StudioPart => ({
  partId,
  name: `Teil ${partId}`,
  firstStepId: stepIds[0] ?? 0,
  lastStepId: stepIds.at(-1) ?? 0,
  stepIds,
  mainVideoId: null,
  adrift,
});

const steps = [stepOf(1, 0, 10), stepOf(2, 10, 20), stepOf(3, 20, 30), stepOf(4, 30, 40)];

describe('partShiftOf', () => {
  const parts = [partOf(10, [1]), partOf(20, [2, 3]), partOf(30, [4])];
  const range = (partId: number, firstStepId: number, lastStepId: number) => ({
    partId,
    firstStepId,
    lastStepId,
  });

  it.each([
    [20, 'later', [range(20, 3, 3), range(10, 1, 2)]],
    [20, 'earlier', null],
    [30, 'earlier', [range(20, 2, 2), range(30, 3, 4)]],
    [30, 'later', null],
    [10, 'earlier', null],
  ] as const)('moves the start of part %s %s', (partId, shift, expected) => {
    expect(partShiftOf(steps, parts, partId, shift)).toEqual(expected);
  });

  it('grows into a loose step before the part', () => {
    expect(partShiftOf(steps, [partOf(20, [3, 4])], 20, 'earlier')).toEqual([range(20, 2, 4)]);
    expect(partShiftOf(steps, [partOf(20, [3, 4])], 20, 'later')).toEqual([range(20, 4, 4)]);
  });
});

describe('newPartOf', () => {
  it.each([
    [
      'splits the part the step lies in',
      [partOf(10, [1, 2, 3])],
      2,
      { firstStepId: 2, lastStepId: 3, shrink: { partId: 10, firstStepId: 1, lastStepId: 1 } },
    ],
    [
      'takes the loose run up to the next part',
      [partOf(10, [4])],
      2,
      { firstStepId: 2, lastStepId: 3, shrink: null },
    ],
    ['takes the loose run up to the end', [], 3, { firstStepId: 3, lastStepId: 4, shrink: null }],
    ['opens nothing on a part start', [partOf(10, [2, 3])], 2, null],
  ] as const)('%s', (_, parts, stepId, expected) => {
    expect(newPartOf(steps, parts, stepId)).toEqual(expected);
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
