import { describe, expect, it } from 'vitest';
import { buildBurstPieces } from './burst-pieces';

describe('buildBurstPieces', () => {
  it('builds the same pieces for the same seed', () => {
    expect(buildBurstPieces(6, 3)).toEqual(buildBurstPieces(6, 3));
  });

  it('varies pieces when the seed changes', () => {
    expect(buildBurstPieces(6, 1)[0]?.offsetX).not.toBe(buildBurstPieces(6, 2)[0]?.offsetX);
  });

  it('cycles through the three confetti colors', () => {
    expect(buildBurstPieces(4, 5).map((piece) => piece.color)).toEqual([
      'red',
      'gold',
      'ink',
      'red',
    ]);
  });
});
