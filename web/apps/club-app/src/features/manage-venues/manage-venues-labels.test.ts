import { describe, expect, it } from 'vitest';
import { findManagedVenue, partitionVenues, toVenueAddressLine } from './manage-venues-labels';
import type { ManagedVenue } from './schemas';

const venue = (overrides: Partial<ManagedVenue>): ManagedVenue => ({
  venueId: 1,
  name: 'Turnhalle',
  street: 'Am Sportplatz 7',
  zip: '99713',
  city: 'Großfurra',
  hint: null,
  archivedOn: null,
  ...overrides,
});

const HALLE = venue({ venueId: 1, name: 'Turnhalle' });
const RAUM = venue({ venueId: 4, name: 'Vereinsraum', hint: 'Zugang über den Hof' });
const LAGER = venue({ venueId: 9, name: 'Altes Lager', archivedOn: '2026-09-12' });
const MAGAZIN = venue({ venueId: 11, name: 'Ölmagazin', archivedOn: '2026-09-13' });

const idsOf = (venues: readonly ManagedVenue[]): number[] => venues.map((found) => found.venueId);

describe('toVenueAddressLine', () => {
  it.each([
    ['Am Sportplatz 7', '99713', 'Großfurra', 'Am Sportplatz 7, 99713 Großfurra'],
    [' ', '  ', ' ', null],
    ['Am Sportplatz 7', '', '', 'Am Sportplatz 7'],
    ['', '99713', 'Großfurra', '99713 Großfurra'],
    ['Am Sportplatz 7', '', 'Großfurra', 'Am Sportplatz 7, Großfurra'],
  ])('joins %j / %j / %j as %j', (street, zip, city, expected) => {
    expect(toVenueAddressLine(venue({ street, zip, city }))).toBe(expected);
  });
});

describe('partitionVenues', () => {
  it('keeps running and archived venues apart in the order they arrived', () => {
    const partition = partitionVenues([HALLE, LAGER, RAUM, MAGAZIN]);

    expect({ running: idsOf(partition.running), archived: idsOf(partition.archived) }).toEqual({
      running: [1, 4],
      archived: [9, 11],
    });
  });
});

describe('findManagedVenue', () => {
  it.each([
    { scenario: 'no venue is targeted', venueId: null, expected: null },
    { scenario: 'an unknown id', venueId: 999, expected: null },
    { scenario: 'the targeted venue', venueId: 9, expected: 9 },
  ])('finds $expected for $scenario', ({ venueId, expected }) => {
    expect(findManagedVenue([HALLE, LAGER], venueId)?.venueId ?? null).toBe(expected);
  });
});
