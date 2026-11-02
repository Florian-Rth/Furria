import { describe, expect, it } from 'vitest';
import { reordered, withHolderMoved } from './list-order';

describe('reordered', () => {
  it.each([
    [0, 2, ['b', 'c', 'a']],
    [2, 0, ['c', 'a', 'b']],
    [1, 1, ['a', 'b', 'c']],
    [1, 5, ['a', 'b', 'c']],
  ])('moves %s to %s', (from, to, order) => {
    expect(reordered(['a', 'b', 'c'], from, to)).toEqual(order);
  });
});

describe('withHolderMoved', () => {
  const holdings = [
    { spotId: 1, number: 1, personId: 10 },
    { spotId: 2, number: 2, personId: 20 },
    { spotId: 3, number: 3, personId: null },
  ];
  const holdersOf = (changed: readonly { personId: number | null }[]) =>
    changed.map((holding) => holding.personId);

  it.each([
    [10, 2, [20, 10, null]],
    [10, 3, [null, 20, 10]],
    [10, null, [null, 20, null]],
    [10, 1, [10, 20, null]],
  ])('moves person %s to spot %s', (personId, spotId, holders) => {
    expect(holdersOf(withHolderMoved(holdings, personId, spotId))).toEqual(holders);
  });

  it('places a person from the open pool', () => {
    const open = holdings.map((holding) =>
      holding.personId === 10 ? { ...holding, personId: null } : holding,
    );

    expect(holdersOf(withHolderMoved(open, 10, 2))).toEqual([null, 10, null]);
  });
});
