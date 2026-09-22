import { describe, expect, it } from 'vitest';
import {
  findManagedVenue,
  partitionVenues,
  toArchiveConsequence,
  toManagedVenuesIntro,
  toRestoreConsequence,
  toVenueAddressLine,
  toVenueFacts,
  toVenueId,
} from './manage-venues-labels';
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
  it('writes street, postcode and city as one German line', () => {
    expect(toVenueAddressLine(HALLE)).toBe('Am Sportplatz 7, 99713 Großfurra');
  });

  it('has no line at all for an Ort without any address part', () => {
    expect(toVenueAddressLine(venue({ street: '', zip: '', city: '' }))).toBeNull();
  });

  it('treats blank-only parts as absent', () => {
    expect(toVenueAddressLine(venue({ street: ' ', zip: '  ', city: ' ' }))).toBeNull();
  });

  it.each([
    ['Am Sportplatz 7', '', '', 'Am Sportplatz 7'],
    ['', '99713', '', '99713'],
    ['', '', 'Großfurra', 'Großfurra'],
    ['Am Sportplatz 7', '99713', '', 'Am Sportplatz 7, 99713'],
    ['Am Sportplatz 7', '', 'Großfurra', 'Am Sportplatz 7, Großfurra'],
    ['', '99713', 'Großfurra', '99713 Großfurra'],
  ])('joins %s / %s / %s without a stray separator', (street, zip, city, expected) => {
    expect(toVenueAddressLine(venue({ street, zip, city }))).toBe(expected);
  });
});

describe('partitionVenues', () => {
  it('keeps running and archived Orte apart in the order they arrived', () => {
    const partition = partitionVenues([HALLE, LAGER, RAUM, MAGAZIN]);

    expect(idsOf(partition.running)).toEqual([1, 4]);
    expect(idsOf(partition.archived)).toEqual([9, 11]);
  });

  it('reports two empty banks for an empty register', () => {
    const partition = partitionVenues([]);

    expect(partition.running).toEqual([]);
    expect(partition.archived).toEqual([]);
  });

  it('puts every Ort into the archived bank when none is running', () => {
    expect(idsOf(partitionVenues([LAGER, MAGAZIN]).running)).toEqual([]);
  });
});

describe('toVenueId', () => {
  it.each([
    { case: 'a positive id', raw: '3', expected: 3 },
    { case: 'a long id', raw: '1204', expected: 1204 },
    { case: 'zero', raw: '0', expected: null },
    { case: 'a negative id', raw: '-3', expected: null },
    { case: 'a word', raw: 'turnhalle', expected: null },
    { case: 'a decimal', raw: '3.5', expected: null },
    { case: 'nothing', raw: '', expected: null },
  ])('reads $case', ({ raw, expected }) => {
    expect(toVenueId(raw)).toBe(expected);
  });
});

describe('findManagedVenue', () => {
  it('finds nothing when no Ort is targeted', () => {
    expect(findManagedVenue([HALLE, LAGER], null)).toBeNull();
  });

  it('finds nothing for an unknown id', () => {
    expect(findManagedVenue([HALLE, LAGER], 999)).toBeNull();
  });

  it('finds the targeted Ort', () => {
    expect(findManagedVenue([HALLE, LAGER], 9)?.name).toBe('Altes Lager');
  });
});

describe('toManagedVenuesIntro', () => {
  it('has its own line for an empty register', () => {
    expect(toManagedVenuesIntro([])).toBe('Noch steht kein Ort im Verzeichnis.');
  });

  it('uses the singular for a single running Ort', () => {
    expect(toManagedVenuesIntro([HALLE])).toBe('Ein Ort steht im Verzeichnis.');
  });

  it('drops the archived sentence when there is none', () => {
    expect(toManagedVenuesIntro([HALLE, RAUM])).toBe('2 Orte stehen im Verzeichnis.');
  });

  it('counts the running Orte and the archived ones separately', () => {
    expect(toManagedVenuesIntro([HALLE, RAUM, LAGER])).toBe(
      '2 Orte stehen im Verzeichnis. Einer ist archiviert.',
    );
  });

  it('says that none is running rather than counting zero', () => {
    expect(toManagedVenuesIntro([LAGER, MAGAZIN])).toBe(
      'Kein Ort steht im Verzeichnis. 2 weitere sind archiviert.',
    );
  });
});

describe('toArchiveConsequence', () => {
  it('states the stamped day rather than offering one', () => {
    expect(toArchiveConsequence('Turnhalle', '12.09.2026')).toContain('Ab dem 12.09.2026');
  });

  it('promises that the Schlüssel and the Termine survive', () => {
    expect(toArchiveConsequence('Turnhalle', '12.09.2026')).toContain('bleiben bestehen');
  });
});

describe('toRestoreConsequence', () => {
  it('states the stamped day rather than offering one', () => {
    expect(toRestoreConsequence('Turnhalle', '12.09.2026')).toContain('Ab dem 12.09.2026');
  });
});

describe('toVenueFacts', () => {
  it('carries the Ort, its Anschrift and the stamped day', () => {
    expect(toVenueFacts(HALLE, '12.09.2026').map((fact) => fact.value)).toEqual([
      'Turnhalle',
      'Am Sportplatz 7, 99713 Großfurra',
      '12.09.2026',
    ]);
  });

  it('leaves the Anschrift out when the Ort has none', () => {
    const facts = toVenueFacts(venue({ street: '', zip: '', city: '' }), '12.09.2026');

    expect(facts.map((fact) => fact.label)).toEqual(['Ort', 'Ab']);
  });
});
