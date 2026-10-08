import { describe, expect, it } from 'vitest';
import {
  findKeyHolding,
  isKeyToTakeBack,
  partitionKeyHoldings,
  partitionKeyVenues,
} from './manage-keys-labels';
import type { KeyHolding, KeyVenue } from './schemas';

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

const venue = (overrides: Partial<KeyVenue>): KeyVenue => ({
  venueId: 1,
  name: 'Requisitenlager',
  archivedOn: null,
  holdings: [],
  ...overrides,
});

const ANNA = holding({ keyHoldingId: 1, personId: 1 });
const MAIK = holding({
  keyHoldingId: 2,
  personId: 2,
  firstName: 'Maik',
  lastName: 'Perlberg',
  sinceOn: '2019-02-01',
  untilOn: '2022-06-30',
});
const BEA = holding({ keyHoldingId: 3, personId: 3, firstName: 'Bea', lastName: 'Kessler' });

const LAGER = venue({ venueId: 1, name: 'Requisitenlager', holdings: [ANNA, MAIK] });
const HALLE = venue({ venueId: 4, name: 'Turnhalle', holdings: [BEA] });

const ALTES_LAGER = venue({ venueId: 9, name: 'Altes Lager', archivedOn: '2021-01-01' });

const idsOf = (holdings: readonly KeyHolding[]): number[] =>
  holdings.map((found) => found.keyHoldingId);

describe('partitionKeyHoldings', () => {
  it('keeps the open key apart from the returned ones', () => {
    const partition = partitionKeyHoldings([ANNA, MAIK, BEA]);

    expect(idsOf(partition.running)).toEqual([1, 3]);
    expect(idsOf(partition.ended)).toEqual([2]);
  });

  it('counts a key as returned the moment it carries a last day', () => {
    expect(idsOf(partitionKeyHoldings([holding({ untilOn: '2099-12-31' })]).ended)).toEqual([1]);
  });
});

describe('isKeyToTakeBack', () => {
  it.each([
    { label: 'an active holder keeps an open key', untilOn: null, active: true, expected: false },
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

describe('partitionKeyVenues', () => {
  it('keeps running venues apart from archived ones in the order they arrived', () => {
    const partition = partitionKeyVenues([LAGER, ALTES_LAGER, HALLE]);

    expect(partition.running.map((found) => found.venueId)).toEqual([1, 4]);
    expect(partition.archived.map((found) => found.venueId)).toEqual([9]);
  });
});

describe('findKeyHolding', () => {
  it.each([
    { scenario: 'no key is targeted', keyHoldingId: null, expected: null },
    { scenario: 'an unknown key', keyHoldingId: 999, expected: null },
    {
      scenario: 'a key held at the second venue',
      keyHoldingId: 3,
      expected: { venueId: 4, keyHoldingId: 3 },
    },
  ])('finds $expected for $scenario', ({ keyHoldingId, expected }) => {
    const target = findKeyHolding([LAGER, HALLE], keyHoldingId);

    expect(
      target === null
        ? null
        : { venueId: target.venue.venueId, keyHoldingId: target.holding.keyHoldingId },
    ).toEqual(expected);
  });
});
