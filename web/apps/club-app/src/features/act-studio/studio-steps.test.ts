import { describe, expect, it } from 'vitest';
import type { Studio, StudioPart, StudioStep } from '@/features/acts/schemas';
import {
  markSecondsOf,
  partBorderStepOf,
  withoutPart,
  withoutStep,
  withPartSettings,
  withStepStart,
} from './studio-steps';

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

const responseOf = (parts: StudioPart[]): { studio: Studio } => ({
  studio: {
    music: { lengthSeconds: 40, source: 'workingMix' },
    songs: [],
    finalTracks: [],
    steps: [...steps, stepOf(9, null, null)],
    parts,
    spots: [],
    videos: [],
    choreography: null,
    stage: null,
    evenings: [],
  },
});

const spansOf = (response: { studio: Studio | null } | undefined): (number | null)[][] =>
  response?.studio?.steps.map((step) => [step.stepId, step.startSeconds, step.endSeconds]) ?? [];

const groupsOf = (response: { studio: Studio | null } | undefined): number[][] =>
  response?.studio?.parts.map((part) => part.stepIds) ?? [];

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

describe('withStepStart', () => {
  it('moves the border between the step and the one before', () => {
    const moved = withStepStart(responseOf([]), { stepId: 3, atSeconds: 15 });

    expect(spansOf(moved).slice(1, 3)).toEqual([
      [2, 10, 15],
      [3, 15, 30],
    ]);
  });
});

describe('withoutStep', () => {
  it.each([
    [2, [1, 0, 20]],
    [1, [2, 0, 20]],
  ])('gives the music of step %s to its neighbour', (stepId, expected) => {
    const removed = withoutStep(responseOf([]), stepId);

    expect(spansOf(removed)[0]).toEqual(expected);
  });

  it('never times an adrift step', () => {
    const removed = withoutStep(
      {
        studio: {
          ...responseOf([]).studio,
          steps: [stepOf(1, 0, 40), stepOf(9, null, null)],
        },
      },
      1,
    );

    expect(spansOf(removed)).toEqual([[9, null, null]]);
  });

  it('drops a part whose only step is removed', () => {
    const removed = withoutStep(responseOf([partOf(10, [1, 2, 3]), partOf(20, [4])]), 4);

    expect(groupsOf(removed)).toEqual([[1, 2, 3]]);
  });
});

describe('withPartSettings', () => {
  it('regroups the steps when a part begins elsewhere', () => {
    const settled = withPartSettings(responseOf([partOf(10, [1, 2, 3]), partOf(20, [4])]), {
      partId: 20,
      settings: { name: 'Ausmarsch', firstStepId: 2, mainVideoId: null },
    });

    expect(groupsOf(settled)).toEqual([[1], [2, 3, 4]]);
  });
});

describe('withoutPart', () => {
  it.each([
    [20, [[1, 2, 3, 4]]],
    [10, [[1, 2, 3, 4]]],
  ])('hands the steps of part %s to a neighbour', (partId, expected) => {
    const removed = withoutPart(responseOf([partOf(10, [1, 2]), partOf(20, [3, 4])]), partId);

    expect(groupsOf(removed)).toEqual(expected);
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
