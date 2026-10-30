import { describe, expect, it } from 'vitest';
import type { StudioGSelection } from './studio-g-selection';
import { pressedSpotsOf, spotsInBoxOf } from './studio-g-selection';

describe('studio-g selection', () => {
  it.each<[StudioGSelection, number, boolean, StudioGSelection]>([
    [{ kind: 'step', stepId: 1 }, 4, false, { kind: 'spots', spotIds: [4] }],
    [{ kind: 'spots', spotIds: [2, 4] }, 3, true, { kind: 'spots', spotIds: [2, 3, 4] }],
    [{ kind: 'spots', spotIds: [2, 4] }, 4, true, { kind: 'spots', spotIds: [2] }],
    [{ kind: 'spots', spotIds: [4] }, 4, true, { kind: 'none' }],
  ])('presses a dot', (selection, spotId, additive, expected) => {
    expect(pressedSpotsOf(selection, spotId, additive)).toEqual(expected);
  });

  it('selects the dots inside a box drawn in any direction', () => {
    const points = [
      { spotId: 3, x: 0.2, y: 0.2 },
      { spotId: 1, x: 0.5, y: 0.5 },
      { spotId: 2, x: 0.9, y: 0.9 },
    ];

    expect(spotsInBoxOf(points, { left: 0.6, top: 0.6, right: 0.1, bottom: 0.1 })).toEqual([1, 3]);
  });
});
