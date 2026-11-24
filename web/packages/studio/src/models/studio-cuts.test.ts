import type { CutEdge, CutSpan } from '@furria/studio/studio-cuts';
import {
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
    ['never ends after the file', 1, 'end', 30.5, 30, null],
    ['never leaves less than half a second', 0, 'start', 9.6, 30, null],
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
  ])('%s', (_, index, edge, at, limit, expected) => {
    expect(trimmedPiecesOf(pieces, index, edge, at, limit)).toEqual(expected);
  });
});

describe('nudgedPiecesOf', () => {
  it.each<[CutEdge, number, CutSpan | null]>([
    ['start', -0.1, { startSeconds: 13.9, endSeconds: 20 }],
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
      2.5,
      [
        { startSeconds: 2, endSeconds: 2.5 },
        { startSeconds: 2.5, endSeconds: 10 },
        { startSeconds: 14, endSeconds: 20 },
      ],
    ],
    [2.4, null],
  ])('splits the first piece at %s', (at, expected) => {
    expect(splitPiecesOf(pieces, 0, at)).toEqual(expected);
  });
});

describe('removedPiecesOf', () => {
  it.each<[CutSpan[], number, CutSpan[] | null]>([
    [[{ startSeconds: 0, endSeconds: 5 }], 0, null],
    [pieces, 3, null],
  ])('removes piece %#', (from, index, expected) => {
    expect(removedPiecesOf(from, index)).toEqual(expected);
  });
});

describe('pieceIndexAt', () => {
  it.each([
    [10, -1],
    [14, 1],
  ])('finds the piece holding second %s', (seconds, index) => {
    expect(pieceIndexAt(pieces, seconds)).toBe(index);
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
