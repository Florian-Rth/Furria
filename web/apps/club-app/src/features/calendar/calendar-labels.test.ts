import { describe, expect, it } from 'vitest';
import {
  toDayEntriesLabel,
  toDeleteConsequence,
  toEntryFacts,
  toEntryMetaLine,
  toEventFactsLine,
  toScopeOptions,
  toVenueOptions,
} from './calendar-labels';
import type { CalendarEntry } from './schemas';

const at = (year: number, month: number, day: number, hour: number, minute = 0): string =>
  new Date(year, month - 1, day, hour, minute).toISOString();

const entry = (overrides: Partial<CalendarEntry>): CalendarEntry => ({
  calendarEntryId: 1,
  title: 'Prunksitzung',
  startsAt: at(2026, 2, 14, 19),
  endsAt: null,
  kind: 'performance',
  venueId: null,
  venueName: null,
  ownerGroupId: null,
  ownerGroupName: null,
  ownerGroupTone: null,
  participatingGroups: [],
  visibility: 'club',
  asksForResponse: false,
  description: null,
  viewerAnswer: null,
  isRunning: false,
  event: null,
  ...overrides,
});

describe('toDayEntriesLabel', () => {
  it.each([
    [1, 'Ein Termin'],
    [3, '3 Termine'],
  ])('reads %i as %s', (count, expected) => {
    expect(toDayEntriesLabel(count)).toBe(expected);
  });
});

describe('toEntryMetaLine', () => {
  it('names the time and the kind of a bare entry', () => {
    expect(toEntryMetaLine(entry({}))).toBe('ab 19:00 Uhr · Auftritt · Verein');
  });

  it('appends the venue when the entry has one', () => {
    expect(toEntryMetaLine(entry({ venueName: 'Stadthalle' }))).toBe(
      'ab 19:00 Uhr · Auftritt · Stadthalle · Verein',
    );
  });

  it('names the owning group instead of the club and says nothing about a group-only reach', () => {
    expect(
      toEntryMetaLine(
        entry({
          endsAt: at(2026, 2, 14, 23),
          kind: 'rehearsal',
          venueName: 'Probenraum',
          ownerGroupId: 3,
          ownerGroupName: 'Garde',
          visibility: 'group',
        }),
      ),
    ).toBe('19:00 – 23:00 Uhr · Probe · Probenraum · Garde');
  });

  it('spells out the reach when a group entry is open to the whole club', () => {
    expect(
      toEntryMetaLine(entry({ ownerGroupId: 3, ownerGroupName: 'Garde', visibility: 'club' })),
    ).toBe('ab 19:00 Uhr · Auftritt · Garde · für alle im Verein');
  });

  it.each([
    [null, 'ab 19:00 Uhr · Auftritt · Verein · öffentlich'],
    ['Garde', 'ab 19:00 Uhr · Auftritt · Garde · öffentlich'],
  ])('marks a public entry owned by %s', (ownerGroupName, expected) => {
    expect(
      toEntryMetaLine(
        entry({
          ownerGroupId: ownerGroupName === null ? null : 3,
          ownerGroupName,
          visibility: 'public',
        }),
      ),
    ).toBe(expected);
  });
});

describe('toScopeOptions', () => {
  it('counts everything, the club-owned entries and every owning group once', () => {
    const options = toScopeOptions([
      entry({ calendarEntryId: 1 }),
      entry({ calendarEntryId: 2 }),
      entry({ calendarEntryId: 3, ownerGroupId: 3, ownerGroupName: 'Garde' }),
      entry({ calendarEntryId: 4, ownerGroupId: 3, ownerGroupName: 'Garde' }),
      entry({ calendarEntryId: 5, ownerGroupId: 1, ownerGroupName: 'Elferrat' }),
    ]);

    expect(options).toEqual([
      { id: 'all', label: 'Alle', count: 5 },
      { id: 'club', label: 'Verein', count: 2 },
      { id: 'group-1', label: 'Elferrat', count: 1 },
      { id: 'group-3', label: 'Garde', count: 2 },
    ]);
  });

  it('offers no group chip when nothing in the window belongs to a group', () => {
    expect(toScopeOptions([entry({})]).map((option) => option.id)).toEqual(['all', 'club']);
  });
});

describe('toEntryFacts', () => {
  it('leaves the venue out when the calendar entry names none', () => {
    const labels = toEntryFacts(entry({ venueName: null })).map((fact) => fact.label);

    expect(labels).not.toContain('Ort');
  });

  it('names the venue when the calendar entry holds one', () => {
    const facts = toEntryFacts(entry({ venueId: 3, venueName: 'Bühnenhaus' }));

    expect(facts.find((fact) => fact.label === 'Ort')?.value).toBe('Bühnenhaus');
  });

  it('reads a group as the owner and the club otherwise', () => {
    const owned = toEntryFacts(entry({ ownerGroupId: 7, ownerGroupName: 'Tanzgarde' }));
    const club = toEntryFacts(entry({}));

    expect(owned.find((fact) => fact.label === 'Eigentümer')?.value).toBe('Tanzgarde');
    expect(club.find((fact) => fact.label === 'Eigentümer')?.value).toBe('Verein');
  });
});

describe('toDeleteConsequence', () => {
  it('warns about the responses only when the calendar entry collects them', () => {
    expect(toDeleteConsequence(entry({ asksForResponse: true }))).toContain('Absagen');
    expect(toDeleteConsequence(entry({ asksForResponse: false }))).not.toContain('Absagen');
  });
});

describe('toVenueOptions', () => {
  it('offers no venue ahead of the venues the club holds', () => {
    const options = toVenueOptions([
      { venueId: 4, name: 'Bühnenhaus' },
      { venueId: 9, name: 'Lager' },
    ]);

    expect(options.map((option) => option.value)).toEqual(['', '4', '9']);
  });
});

describe('toEventFactsLine', () => {
  const facts = {
    doorsOpenAt: null,
    teaser: 'Der Abend der Session.',
    ageHint: null,
    priceCents: null,
    presaleStartsAt: null,
    status: 'announced' as const,
  };

  it('joins the doors, the price and the age hint', () => {
    expect(
      toEventFactsLine({ ...facts, doorsOpenAt: '18:30', priceCents: 2_200, ageHint: 'ab 16' }),
    ).toBe('Einlass 18:30 Uhr · 22,00 € · ab 16');
  });

  it('leaves out what the club has not set', () => {
    expect(toEventFactsLine({ ...facts, priceCents: 0 })).toBe('Eintritt frei');
  });

  it('has no line when nothing is set', () => {
    expect(toEventFactsLine(facts)).toBeNull();
  });
});
