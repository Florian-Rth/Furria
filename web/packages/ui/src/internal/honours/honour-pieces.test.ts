import { describe, expect, it } from 'vitest';
import { lapOf } from './honour-laps';
import { lapPiecesOf } from './honour-pieces';

describe('lapPiecesOf', () => {
  it('strikes the counted pieces and shows the previous metal on the rest', () => {
    const faces = lapPiecesOf(lapOf(8), 20, 18, 1.7).map((piece) => piece.face);

    expect(faces).toEqual([
      { kind: 'metal', metal: 'silver' },
      { kind: 'metal', metal: 'silver' },
      { kind: 'metal', metal: 'silver' },
      { kind: 'under', metal: 'bronze' },
      { kind: 'under', metal: 'bronze' },
      { kind: 'under', metal: 'bronze' },
    ]);
  });

  it('leaves the first lap’s unstruck pieces on a bare track', () => {
    const faces = lapPiecesOf(lapOf(4), 20, 18, 1.7).map((piece) => piece.face.kind);

    expect(faces).toEqual(['metal', 'metal', 'metal', 'metal', 'track']);
  });

  it('forges a closed lap into one band', () => {
    expect(lapPiecesOf(lapOf(22), 20, 18, 1.7)).toEqual([
      {
        key: 'band-2',
        path: 'M20 2A18 18 0 1 1 20 38A18 18 0 1 1 20 2',
        face: { kind: 'metal', metal: 'gold' },
        order: 0,
      },
    ]);
  });

  it('draws nothing without sessions', () => {
    expect(lapPiecesOf(lapOf(0), 20, 18, 1.7)).toEqual([]);
  });
});
