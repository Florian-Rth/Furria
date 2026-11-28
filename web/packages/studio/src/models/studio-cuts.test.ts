import type { CutEdge, CutRoom, CutSpan } from '@furria/studio/studio-cuts';
import {
  cutRoomOf,
  nudgedCutOf,
  playheadInOf,
  shiftedPositionOf,
  splitPointOf,
  trimmedCutOf,
} from '@furria/studio/studio-cuts';
import { describe, expect, it } from 'vitest';

const cut: CutSpan = { startSeconds: 14, endSeconds: 20 };
const room: CutRoom = { lowest: 10, highest: 30 };

describe('cutRoomOf', () => {
  it.each<[string, CutSpan[], number | null, CutRoom]>([
    ['reaches the whole file without other halves', [], 30, { lowest: 0, highest: 30 }],
    [
      'stops at the halves of the same file around it',
      [
        { startSeconds: 2, endSeconds: 10 },
        { startSeconds: 24, endSeconds: 28 },
      ],
      30,
      { lowest: 10, highest: 24 },
    ],
    [
      'ends anywhere while the file length is unknown',
      [{ startSeconds: 2, endSeconds: 10 }],
      null,
      { lowest: 10, highest: Number.POSITIVE_INFINITY },
    ],
  ])('%s', (_, siblings, limit, expected) => {
    expect(cutRoomOf(cut, siblings, limit)).toEqual(expected);
  });
});

describe('trimmedCutOf', () => {
  it.each<[string, CutEdge, number, CutSpan | null]>([
    [
      'brings cut-out music back up to the half before',
      'start',
      10,
      { startSeconds: 10, endSeconds: 20 },
    ],
    ['never overlaps the half before', 'start', 9.9, null],
    ['never ends after the room', 'end', 30.5, null],
    ['never leaves less than half a second', 'start', 19.6, null],
    ['rounds to a millisecond', 'end', 25.12345, { startSeconds: 14, endSeconds: 25.123 }],
  ])('%s', (_, edge, at, expected) => {
    expect(trimmedCutOf(cut, edge, at, room)).toEqual(expected);
  });
});

describe('nudgedCutOf', () => {
  it.each<[CutEdge, number, CutSpan | null]>([
    ['start', -0.1, { startSeconds: 13.9, endSeconds: 20 }],
    ['end', -0.01, { startSeconds: 14, endSeconds: 19.99 }],
  ])('moves the %s by %s', (edge, delta, expected) => {
    expect(nudgedCutOf(cut, edge, delta, room)).toEqual(expected);
  });

  it('refuses a nudge past the room', () => {
    expect(nudgedCutOf(cut, 'end', 0.1, { lowest: 0, highest: 20 })).toBeNull();
  });
});

describe('splitPointOf', () => {
  it.each<[number, number | null]>([
    [14.5, 14.5],
    [14.4, null],
    [19.5004, 19.5],
    [19.6, null],
  ])('splits at %s', (at, expected) => {
    expect(splitPointOf(cut, at)).toBe(expected);
  });
});

describe('shiftedPositionOf', () => {
  it.each([
    ['holds a playhead inside the cut at its start', 6, 5, 2, 5],
    ['pushes a playhead after added music on', 10, 5, -2, 12],
  ])('%s', (_, position, at, removed, expected) => {
    expect(shiftedPositionOf(position, at, removed)).toBe(expected);
  });
});

describe('playheadInOf', () => {
  it.each([
    [18.1, null],
    [9.9995, 1.9995],
  ])('reads timeline second %s as source second %s', (seconds, expected) => {
    const at = playheadInOf(10, 18, 2, seconds);

    expect(at === null ? null : Math.round(at * 10_000) / 10_000).toBe(expected);
  });
});
