import { describe, expect, it } from 'vitest';
import {
  beatPlaceOf,
  countNumbersOf,
  countsIn,
  isMovableEdge,
  movedBorderOf,
  neighbourIdOf,
  spansOf,
} from './studio-i-spans';

const spans = [
  { stepId: 1, start: 0, end: 4 },
  { stepId: 2, start: 4, end: 8 },
  { stepId: 3, start: 8, end: 12 },
];

const marks = Array.from({ length: 12 }, (_, index) => ({
  seconds: index,
  count: (index % 8) + 1,
}));

describe('spansOf', () => {
  it('keeps only steps on the music, in time order', () => {
    expect(
      spansOf([
        {
          stepId: 2,
          name: 'B',
          description: null,
          startSeconds: 5,
          endSeconds: 9,
          placement: 'onTimeline',
        },
        {
          stepId: 1,
          name: 'A',
          description: null,
          startSeconds: 0,
          endSeconds: 5,
          placement: 'onTimeline',
        },
        {
          stepId: 3,
          name: 'C',
          description: null,
          startSeconds: null,
          endSeconds: null,
          placement: 'cutAway',
        },
      ]),
    ).toEqual([
      { stepId: 1, start: 0, end: 5 },
      { stepId: 2, start: 5, end: 9 },
    ]);
  });
});

describe('neighbourIdOf', () => {
  it.each([
    [2, 'back', 1],
    [2, 'forward', 3],
    [1, 'back', null],
    [3, 'forward', null],
    [9, 'forward', null],
  ] as const)('step %i %s → %s', (stepId, direction, expected) => {
    expect(neighbourIdOf(spans, stepId, direction)).toBe(expected);
  });
});

describe('isMovableEdge', () => {
  it.each([
    [1, 'start', false],
    [1, 'end', true],
    [3, 'end', false],
    [3, 'start', true],
  ] as const)('step %i %s → %s', (stepId, edge, expected) => {
    expect(isMovableEdge(spans, stepId, edge)).toBe(expected);
  });
});

describe('movedBorderOf', () => {
  it('moves the start of a step and the end of the step before it, snapped to a count', () => {
    expect(movedBorderOf(spans, 2, 'start', 2.6, marks)).toEqual([
      { stepId: 1, start: 0, end: 3 },
      { stepId: 2, start: 3, end: 8 },
      { stepId: 3, start: 8, end: 12 },
    ]);
  });

  it('moves the end of a step and the start of the step after it', () => {
    expect(movedBorderOf(spans, 2, 'end', 9.4, marks)[2]).toEqual({ stepId: 3, start: 9, end: 12 });
  });

  it('never lets a border pass the neighbour steps, keeping at least one count', () => {
    expect(movedBorderOf(spans, 2, 'start', -5, marks)[1]).toEqual({ stepId: 2, start: 1, end: 8 });
  });

  it('leaves the first start and the last end where the music starts and ends', () => {
    expect(movedBorderOf(spans, 1, 'start', 2, marks)).toEqual(spans);
    expect(movedBorderOf(spans, 3, 'end', 10, marks)).toEqual(spans);
  });

  it('moves freely inside the neighbours when the music has no counts', () => {
    expect(movedBorderOf(spans, 2, 'start', 2.5, [])[1]).toEqual({ stepId: 2, start: 2.5, end: 8 });
  });
});

describe('countsIn', () => {
  it('counts the beats from the start up to the end of a step', () => {
    expect(countsIn(marks, { stepId: 1, start: 0, end: 4 })).toBe(4);
  });
});

describe('beatPlaceOf', () => {
  const long = { stepId: 9, start: 0, end: 12 };

  it('names the eight and the count where a move starts', () => {
    expect(beatPlaceOf(marks, long, 9, 'start')).toEqual({ eight: 2, count: 2 });
  });

  it('names the last count before a move ends', () => {
    expect(beatPlaceOf(marks, long, 8, 'end')).toEqual({ eight: 1, count: 8 });
  });

  it('has no place outside the counts', () => {
    expect(beatPlaceOf([], long, 3, 'start')).toBeNull();
  });
});

describe('countNumbersOf', () => {
  it.each([
    [32, false, 'downbeats'],
    [16, false, 'halves'],
    [32, true, 'all'],
    [64, true, 'halves'],
  ] as const)('%i counts, wide %s → %s', (counts, wide, expected) => {
    expect(countNumbersOf(counts, wide)).toBe(expected);
  });
});
