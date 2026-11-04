import type { CutEdge, CutReach, CutSpan } from '@furria/studio/studio-cuts';
import {
  cutReachOf,
  nudgedPiecesOf,
  pieceIndexAt,
  playheadInOf,
  removedPiecesOf,
  shiftedPositionOf,
  splitPiecesOf,
  trimmedPiecesOf,
} from '@furria/studio/studio-cuts';
import { describe, expect, it } from 'vitest';

const pieces: CutSpan[] = [
  { startSeconds: 2, endSeconds: 10 },
  { startSeconds: 14, endSeconds: 20 },
];

describe('trimmedPiecesOf', () => {
  it.each<[string, number, CutEdge, number, number | null, CutSpan[] | null]>([
    [
      'starts a piece exactly at the playhead',
      0,
      'start',
      3.4567,
      30,
      [
        { startSeconds: 3.457, endSeconds: 10 },
        { startSeconds: 14, endSeconds: 20 },
      ],
    ],
    [
      'ends a piece exactly at the playhead',
      1,
      'end',
      17.25,
      30,
      [
        { startSeconds: 2, endSeconds: 10 },
        { startSeconds: 14, endSeconds: 17.25 },
      ],
    ],
    [
      'brings cut-out music back up to the piece before',
      1,
      'start',
      10,
      30,
      [
        { startSeconds: 2, endSeconds: 10 },
        { startSeconds: 10, endSeconds: 20 },
      ],
    ],
    ['never overlaps the piece before', 1, 'start', 9.9, 30, null],
    ['never overlaps the piece after', 0, 'end', 14.1, 30, null],
    ['never starts before the file', 0, 'start', -0.1, 30, null],
    ['never ends after the file', 1, 'end', 30.5, 30, null],
    ['never leaves less than half a second', 0, 'start', 9.6, 30, null],
    [
      'keeps exactly half a second',
      0,
      'start',
      9.5,
      30,
      [
        { startSeconds: 9.5, endSeconds: 10 },
        { startSeconds: 14, endSeconds: 20 },
      ],
    ],
    [
      'ends anywhere while the file length is unknown',
      1,
      'end',
      45,
      null,
      [
        { startSeconds: 2, endSeconds: 10 },
        { startSeconds: 14, endSeconds: 45 },
      ],
    ],
    ['has nothing to trim without the piece', 4, 'start', 3, 30, null],
  ])('%s', (_, index, edge, at, limit, expected) => {
    expect(trimmedPiecesOf(pieces, index, edge, at, limit)).toEqual(expected);
  });
});

describe('nudgedPiecesOf', () => {
  it.each<[CutEdge, number, CutSpan | null]>([
    ['start', 0.01, { startSeconds: 14.01, endSeconds: 20 }],
    ['start', -0.1, { startSeconds: 13.9, endSeconds: 20 }],
    ['end', 0.1, { startSeconds: 14, endSeconds: 20.1 }],
    ['end', -0.01, { startSeconds: 14, endSeconds: 19.99 }],
  ])('moves the %s of a piece by %s', (edge, delta, expected) => {
    expect(nudgedPiecesOf(pieces, 1, edge, delta, 30)?.[1] ?? null).toEqual(expected);
  });

  it('refuses a nudge past the file end', () => {
    expect(nudgedPiecesOf(pieces, 1, 'end', 0.1, 20)).toBeNull();
  });
});

describe('splitPiecesOf', () => {
  it.each<[number, CutSpan[] | null]>([
    [
      5.123,
      [
        { startSeconds: 2, endSeconds: 5.123 },
        { startSeconds: 5.123, endSeconds: 10 },
        { startSeconds: 14, endSeconds: 20 },
      ],
    ],
    [
      2.5,
      [
        { startSeconds: 2, endSeconds: 2.5 },
        { startSeconds: 2.5, endSeconds: 10 },
        { startSeconds: 14, endSeconds: 20 },
      ],
    ],
    [2.4, null],
    [9.6, null],
  ])('splits the first piece at %s', (at, expected) => {
    expect(splitPiecesOf(pieces, 0, at)).toEqual(expected);
  });
});

describe('removedPiecesOf', () => {
  it.each<[CutSpan[], number, CutSpan[] | null]>([
    [pieces, 0, [{ startSeconds: 14, endSeconds: 20 }]],
    [[{ startSeconds: 0, endSeconds: 5 }], 0, null],
    [pieces, 3, null],
  ])('removes piece %#', (from, index, expected) => {
    expect(removedPiecesOf(from, index)).toEqual(expected);
  });
});

describe('pieceIndexAt', () => {
  it.each([
    [2, 0],
    [9.99, 0],
    [10, -1],
    [14, 1],
    [20, -1],
  ])('finds the piece holding second %s', (seconds, index) => {
    expect(pieceIndexAt(pieces, seconds)).toBe(index);
  });
});

describe('shiftedPositionOf', () => {
  it.each([
    ['keeps a playhead before the cut', 3, 5, 2, 3],
    ['pulls a playhead after the cut back', 10, 5, 2, 8],
    ['holds a playhead inside the cut at its start', 6, 5, 2, 5],
    ['pushes a playhead after added music on', 10, 5, -2, 12],
  ])('%s', (_, position, at, removed, expected) => {
    expect(shiftedPositionOf(position, at, removed)).toBe(expected);
  });
});

describe('playheadInOf', () => {
  it.each([
    [10, 2],
    [12.5, 4.5],
    [18, 10],
    [9.9, null],
    [18.1, null],
    [9.9995, 1.9995],
    [18.0005, 10.0005],
  ])('reads timeline second %s as source second %s', (seconds, expected) => {
    const at = playheadInOf(10, 18, 2, seconds);

    expect(at === null ? null : Math.round(at * 10_000) / 10_000).toBe(expected);
  });
});

describe('cutReachOf', () => {
  it.each<[number | null, CutReach]>([
    [5, { startHere: true, split: true, endHere: true }],
    [2.2, { startHere: true, split: false, endHere: false }],
    [9.8, { startHere: false, split: false, endHere: true }],
    [null, { startHere: false, split: false, endHere: false }],
  ])('offers the cuts at %s', (at, reach) => {
    expect(cutReachOf(pieces, 0, at, 30)).toEqual(reach);
  });
});
