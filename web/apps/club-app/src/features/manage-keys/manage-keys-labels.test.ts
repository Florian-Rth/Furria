import { describe, expect, it } from 'vitest';
import {
  findKeyHolding,
  partitionKeyHoldings,
  partitionKeyVenues,
  toHandoutConsequence,
  toHoldingPeriodLabel,
  toReturnConsequence,
  toVenueEmptyCopy,
  toVenueHolderMeta,
} from './manage-keys-labels';
import type { KeyHolding, KeyVenue } from './schemas';

const holding = (overrides: Partial<KeyHolding>): KeyHolding => ({
  keyHoldingId: 1,
  personId: 1,
  firstName: 'Anna',
  lastName: 'Kaiser',
  sinceOn: '2024-03-01',
  untilOn: null,
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

  it('reports two empty banks for a venue nobody ever held a key for', () => {
    const partition = partitionKeyHoldings([]);

    expect(partition.running).toEqual([]);
    expect(partition.ended).toEqual([]);
  });
});

describe('partitionKeyVenues', () => {
  it('keeps running venues apart from archived ones in the order they arrived', () => {
    const partition = partitionKeyVenues([LAGER, ALTES_LAGER, HALLE]);

    expect(partition.running.map((found) => found.venueId)).toEqual([1, 4]);
    expect(partition.archived.map((found) => found.venueId)).toEqual([9]);
  });

  it('puts every venue into the archived bank when none is running', () => {
    expect(partitionKeyVenues([ALTES_LAGER]).running).toEqual([]);
  });
});

describe('toHoldingPeriodLabel', () => {
  it('opens the period for a key that is still out', () => {
    expect(toHoldingPeriodLabel(ANNA)).toBe('seit 01.03.2024');
  });

  it('spans both ends for a key that came back', () => {
    expect(toHoldingPeriodLabel(MAIK)).toContain('01.02.2019');
    expect(toHoldingPeriodLabel(MAIK)).toContain('30.06.2022');
  });
});

describe('findKeyHolding', () => {
  it('finds nothing when no key is targeted', () => {
    expect(findKeyHolding([LAGER, HALLE], null)).toBeNull();
  });

  it('finds nothing for an unknown key', () => {
    expect(findKeyHolding([LAGER, HALLE], 999)).toBeNull();
  });

  it('carries the venue the found key belongs to', () => {
    const target = findKeyHolding([LAGER, HALLE], 3);

    expect(target?.venue.venueId).toBe(4);
    expect(target?.holding.keyHoldingId).toBe(3);
  });
});

describe('toVenueHolderMeta', () => {
  it('names no key when every one came back', () => {
    expect(toVenueHolderMeta([MAIK])).toBe('kein Schlüssel');
  });

  it('counts only the keys that are still out', () => {
    expect(toVenueHolderMeta([ANNA, MAIK])).toBe('1 Schlüssel');
    expect(toVenueHolderMeta([ANNA, BEA, MAIK])).toBe('2 Schlüssel');
  });
});

describe('toVenueEmptyCopy', () => {
  it('separates a venue that never had a key from one whose key came back', () => {
    expect(toVenueEmptyCopy([]).title).not.toBe(toVenueEmptyCopy([MAIK]).title);
  });
});

describe('toHandoutConsequence', () => {
  it('speaks of a key that is already out', () => {
    expect(toHandoutConsequence('Anna Kaiser', 'Turnhalle', '2026-09-20', '2026-09-20')).toContain(
      'seit dem 20.09.2026',
    );
  });

  it('dates a handout ahead from its first day', () => {
    expect(toHandoutConsequence('Anna Kaiser', 'Turnhalle', '2026-11-11', '2026-09-20')).toContain(
      'ab dem 11.11.2026',
    );
  });
});

describe('toReturnConsequence', () => {
  it('reports the key as returned when the last day is today', () => {
    expect(toReturnConsequence('Anna', 'Turnhalle', '2026-09-20', '2026-09-20')).toContain(
      'ist zum 20.09.2026 zurückgegeben',
    );
  });

  it('keeps the key usable until a last day dated ahead', () => {
    expect(toReturnConsequence('Anna', 'Turnhalle', '2026-11-11', '2026-09-20')).toContain(
      'bis einschließlich 11.11.2026',
    );
  });
});
