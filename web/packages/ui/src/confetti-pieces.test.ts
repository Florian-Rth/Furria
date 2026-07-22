import { describe, expect, it } from 'vitest';
import { buildConfettiPieces } from './confetti-pieces';

describe('buildConfettiPieces', () => {
  it('is deterministic for the same seed', () => {
    expect(buildConfettiPieces(18, 11)).toEqual(buildConfettiPieces(18, 11));
  });

  it('produces the requested number of pieces with sane values', () => {
    const pieces = buildConfettiPieces(24, 7);

    expect(pieces).toHaveLength(24);
    for (const piece of pieces) {
      expect(piece.leftPercent).toBeGreaterThanOrEqual(0);
      expect(piece.leftPercent).toBeLessThan(100);
      expect(piece.durationSeconds).toBeGreaterThanOrEqual(6);
      expect(piece.durationSeconds).toBeLessThanOrEqual(12);
      expect(piece.delaySeconds).toBeLessThanOrEqual(0);
    }
  });
});
