import { describe, expect, it } from 'vitest';
import { buildBurstPieces } from './burst-pieces';

describe('buildBurstPieces', () => {
  it('builds the requested number of pieces', () => {
    expect(buildBurstPieces(12, 11)).toHaveLength(12);
  });

  it('is deterministic for a given seed', () => {
    expect(buildBurstPieces(6, 3)).toEqual(buildBurstPieces(6, 3));
  });

  it('varies pieces when the seed changes', () => {
    const first = buildBurstPieces(6, 1);
    const second = buildBurstPieces(6, 2);

    expect(first[0]?.offsetX).not.toBe(second[0]?.offsetX);
  });

  it('cycles through the three confetti colors', () => {
    const pieces = buildBurstPieces(3, 5);

    expect(pieces.map((piece) => piece.color)).toEqual(['red', 'gold', 'ink']);
  });
});
