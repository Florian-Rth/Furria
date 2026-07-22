import { describe, expect, it } from 'vitest';
import { buildScatterPieces } from './scatter-pieces';

describe('buildScatterPieces', () => {
  it('is deterministic for the same seed', () => {
    expect(buildScatterPieces(12, 12)).toEqual(buildScatterPieces(12, 12));
  });

  it('varies pieces when the seed changes', () => {
    const first = buildScatterPieces(8, 1);
    const second = buildScatterPieces(8, 2);

    expect(first[0]?.xPercent).not.toBe(second[0]?.xPercent);
  });

  it('caps the count at thirteen chips', () => {
    expect(buildScatterPieces(40, 3)).toHaveLength(13);
  });

  it('positions every chip inside its box with only a small rotation', () => {
    const pieces = buildScatterPieces(13, 12);

    for (const piece of pieces) {
      expect(piece.xPercent).toBeGreaterThanOrEqual(0);
      expect(piece.xPercent).toBeLessThanOrEqual(100);
      expect(piece.yPercent).toBeGreaterThanOrEqual(0);
      expect(piece.yPercent).toBeLessThanOrEqual(100);
      expect(Math.abs(piece.rotation)).toBeLessThanOrEqual(24);
    }
  });

  it('cycles through the three brand colors', () => {
    const pieces = buildScatterPieces(3, 5);

    expect(pieces.map((piece) => piece.color)).toEqual(['red', 'gold', 'ink']);
  });
});
