import { describe, expect, it } from 'vitest';
import { nameSidesOf } from './focus-names';

describe('nameSidesOf', () => {
  it('alternates names along a tight line', () => {
    const line = [0.1, 0.18, 0.26, 0.34].map((x, index) => ({ spotId: index + 1, x, y: 0.5 }));

    expect([...nameSidesOf(line, []).entries()].sort(([left], [right]) => left - right)).toEqual([
      [1, 'below'],
      [2, 'above'],
      [3, 'below'],
      [4, 'above'],
    ]);
  });

  it('keeps names below when dots stand apart', () => {
    const spread = [
      { spotId: 1, x: 0.1, y: 0.2 },
      { spotId: 2, x: 0.5, y: 0.2 },
      { spotId: 3, x: 0.12, y: 0.6 },
    ];

    expect([...nameSidesOf(spread, []).values()]).toEqual(['below', 'below', 'below']);
  });

  it('hides the third crowded name unless it is selected', () => {
    const cluster = [
      { spotId: 1, x: 0.1, y: 0.5 },
      { spotId: 2, x: 0.12, y: 0.5 },
      { spotId: 3, x: 0.14, y: 0.5 },
    ];
    const plain = nameSidesOf(cluster, []);
    const chosen = nameSidesOf(cluster, [3]);

    expect([plain.get(1), plain.get(2), plain.get(3), chosen.get(3)]).toEqual([
      'below',
      'above',
      'none',
      'below',
    ]);
  });
});
