import { describe, expect, it } from 'vitest';
import { isKeyToTakeBack, partitionKeyHoldings } from './manage-keys-labels';
import type { KeyHolding } from './schemas';

const holding = (overrides: Partial<KeyHolding>): KeyHolding => ({
  keyHoldingId: 1,
  personId: 1,
  firstName: 'Anna',
  lastName: 'Kaiser',
  sinceOn: '2024-03-01',
  untilOn: null,
  holderIsActiveInClub: true,
  ...overrides,
});

const idsOf = (holdings: readonly KeyHolding[]): number[] =>
  holdings.map((found) => found.keyHoldingId);

describe('partitionKeyHoldings', () => {
  it('counts a key as returned the moment it carries a last day', () => {
    expect(idsOf(partitionKeyHoldings([holding({ untilOn: '2099-12-31' })]).ended)).toEqual([1]);
  });
});

describe('isKeyToTakeBack', () => {
  it.each([
    {
      label: 'an inactive holder still has an open key',
      untilOn: null,
      active: false,
      expected: true,
    },
    {
      label: 'an inactive holder has a return dated ahead',
      untilOn: '2026-12-31',
      active: false,
      expected: false,
    },
  ])('asks for the key back: $expected when $label', ({ untilOn, active, expected }) => {
    expect(isKeyToTakeBack(holding({ untilOn, holderIsActiveInClub: active }))).toBe(expected);
  });
});
