import { describe, expect, it } from 'vitest';
import {
  bracketGrabOf,
  bracketGripOf,
  bracketMoveOf,
  bracketSharesOf,
  pannedCentreOf,
} from './overview-bracket';

describe('bracketSharesOf', () => {
  it.each([
    [{ start: -10, end: 10 }, 100, { from: 0, to: 0.1 }],
    [{ start: 90, end: 110 }, 100, { from: 0.9, to: 1 }],
    [{ start: 10, end: 20 }, 0, { from: 0, to: 0 }],
  ])('places %o on the whole act', (view, length, expected) => {
    expect(bracketSharesOf(view, length)).toEqual(expected);
  });
});

describe('bracketGripOf', () => {
  const wide = { from: 0.2, to: 0.6 };

  it.each([
    [10, 'track'],
    [185, 'start'],
    [215, 'start'],
    [300, 'body'],
    [590, 'end'],
    [618, 'end'],
    [700, 'track'],
  ] as const)('reads x %d on a wide bracket as %s', (x, expected) => {
    expect(bracketGripOf(x, 1000, wide)).toBe(expected);
  });

  it.each([
    [70, 'start'],
    [92, 'start'],
    [100, 'body'],
    [106, 'end'],
    [130, 'end'],
  ] as const)('keeps the middle of a narrow bracket for panning (x %d → %s)', (x, expected) => {
    expect(bracketGripOf(x, 1000, { from: 0.09, to: 0.11 })).toBe(expected);
  });
});

describe('bracketMoveOf', () => {
  const view = { start: 20, end: 40 };

  it.each([
    ['end', 60, { kind: 'frame', start: 20, end: 60 }],
    ['start', 30, { kind: 'frame', start: 30, end: 40 }],
    ['start', 39.8, { kind: 'frame', start: 39, end: 40 }],
    ['end', 500, { kind: 'frame', start: 20, end: 100 }],
  ] as const)('drags the %s edge to %ds', (grip, seconds, expected) => {
    const edge = grip === 'start' ? view.start : view.end;
    expect(bracketMoveOf(bracketGrabOf(grip, view, edge), seconds, 100)).toEqual(expected);
  });

  it('keeps the distance between the finger and the edge it grabbed', () => {
    expect(bracketMoveOf(bracketGrabOf('end', view, 43), 53, 100)).toEqual({
      kind: 'frame',
      start: 20,
      end: 50,
    });
  });

  it('measures an edge from the part of the view that lies on the act', () => {
    expect(bracketMoveOf(bracketGrabOf('end', { start: -10, end: 10 }, 10), 20, 100)).toEqual({
      kind: 'frame',
      start: 0,
      end: 20,
    });
  });

  it.each([
    ['body', 34, 50, 46],
    ['track', 70, 50, 50],
    ['body', 39, 2, 0],
  ] as const)('centres a %s grab from %ds dragged to %ds on %ds', (grip, from, to, expected) => {
    expect(bracketMoveOf(bracketGrabOf(grip, view, from), to, 100)).toEqual({
      kind: 'centre',
      seconds: expected,
    });
  });
});

describe('pannedCentreOf', () => {
  it.each([
    [{ start: 20, end: 40 }, 1, 35],
    [{ start: 20, end: 40 }, -1, 25],
    [{ start: -10, end: 4 }, -1, 0],
    [{ start: 95, end: 115 }, 1, 100],
  ] as const)('pans %o a quarter view going %d', (view, direction, expected) => {
    expect(pannedCentreOf(view, direction, 100)).toBe(expected);
  });
});
