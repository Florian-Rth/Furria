import { describe, expect, it } from 'vitest';
import {
  bookableOf,
  centsOfPriceText,
  crateStateOf,
  hubSummaryOf,
  journalOf,
  openCratesOf,
  paymentPreviewOf,
  rosterOf,
  signedCountOfText,
  stockChangeOf,
  stockSeriesOf,
} from './beer-hub';
import { tileEuroOf } from './beer-hub-copy';

const NOW = '2026-11-04T18:00:00.000Z';

describe('stockChangeOf', () => {
  it.each([
    [24, { kind: 'delivery', crates: 24 }],
    [-2, { kind: 'correction', crates: -2 }],
    [0, null],
  ] as const)('%i gives %j', (crates, expected) => {
    expect(stockChangeOf(crates)).toEqual(expected);
  });
});

describe('signedCountOfText', () => {
  it.each([
    ['3', 3],
    [' 12 ', 12],
    ['-4', -4],
    ['+5', 5],
    ['−2', -2],
    ['', 0],
    ['x', 0],
    ['2,5', 0],
  ])('%j → %i', (text, expected) => {
    expect(signedCountOfText(text)).toBe(expected);
  });
});

describe('centsOfPriceText', () => {
  it.each([
    ['18,00', 1800],
    ['18', 1800],
    ['17.5', 1750],
    ['16,95 €', 1695],
    ['0', null],
    ['abc', null],
    ['1,234', null],
  ])('%s → %s', (text, cents) => {
    expect(centsOfPriceText(text)).toBe(cents);
  });
});

const person = (personId: number, firstName: string, lastName: string) => ({
  personId,
  firstName,
  lastName,
});

const crate = (
  crateId: number,
  personId: number,
  bookedAt: string,
  extra: { undoneAt?: string; beerPaymentId?: number; priceCents?: number } = {},
) => ({
  crateId,
  person: person(personId, 'P', `${personId}`),
  priceCents: extra.priceCents ?? 1500,
  bookedAt,
  enteredBy: person(personId, 'P', `${personId}`),
  undoneAt: extra.undoneAt ?? null,
  beerPaymentId: extra.beerPaymentId ?? null,
});

describe('openCratesOf and paymentPreviewOf', () => {
  it('settles the oldest open crates of the person first, at their own prices', () => {
    const crates = [
      crate(4, 1, '2026-11-03T10:00:00.000Z'),
      crate(3, 1, '2026-10-20T10:00:00.000Z', { priceCents: 1300 }),
      crate(2, 1, '2026-10-10T10:00:00.000Z', { beerPaymentId: 9 }),
      crate(5, 1, '2026-10-01T10:00:00.000Z', { undoneAt: '2026-10-01T10:00:05.000Z' }),
      crate(6, 2, '2026-09-01T10:00:00.000Z'),
    ];

    const open = openCratesOf(crates, 1);
    const preview = paymentPreviewOf(open, 1);

    expect(open.map((entry) => entry.crateId)).toEqual([3, 4]);
    expect(preview.lines.map((line) => [line.crate.crateId, line.settled])).toEqual([
      [3, true],
      [4, false],
    ]);
    expect(preview.cents).toBe(1300);
  });
});

describe('crateStateOf', () => {
  it.each([
    ['2026-11-03T10:00:00.000Z', null, 'open'],
    ['2026-10-28T18:00:00.000Z', null, 'overdue'],
    ['2026-10-28T18:00:01.000Z', null, 'open'],
    ['2026-10-01T10:00:00.000Z', 4, 'paid'],
  ] as const)('booked %s, payment %s → %s', (bookedAt, beerPaymentId, expected) => {
    const booked = crate(1, 1, bookedAt, beerPaymentId === null ? {} : { beerPaymentId });

    expect(crateStateOf(booked, NOW)).toBe(expected);
  });
});

describe('stockSeriesOf', () => {
  it('counts deliveries in and taken crates out per day, an undone crate only until its undo', () => {
    const movements = [
      {
        movementId: 1,
        kind: 'delivery' as const,
        crates: 10,
        bookedAt: '2026-11-01T10:00:00.000Z',
        bookedBy: null,
      },
    ];
    const crates = [
      crate(1, 1, '2026-11-02T10:00:00.000Z'),
      crate(2, 1, '2026-11-02T10:00:00.000Z', { undoneAt: '2026-11-03T12:00:00.000Z' }),
    ];

    expect(stockSeriesOf(movements, crates, NOW, 5)).toEqual([0, 10, 8, 9, 9]);
  });
});

const tab = (personId: number, lastName: string, openCrates: number, oldest: string | null) => ({
  person: person(personId, 'P', lastName),
  isEnrolled: true,
  openCrates,
  openCents: openCrates * 1500,
  paidCrates: 0,
  paidCents: 0,
  oldestOpenBookedAt: oldest,
  payments: [],
});

const enrollment = (enrollmentId: number, personId: number, lastName: string, ended = false) => ({
  enrollmentId,
  personId,
  firstName: 'P',
  lastName,
  startedAt: '2026-01-01T10:00:00.000Z',
  endedAt: ended ? '2026-10-01T10:00:00.000Z' : null,
  endedBy: null,
});

describe('rosterOf', () => {
  it('lists running enrollees and anyone still owing, longest open first, and drops settled former enrollees', () => {
    const roster = rosterOf(
      [
        tab(1, 'Albers', 1, '2026-11-02T10:00:00.000Z'),
        tab(2, 'Berg', 2, '2026-10-20T10:00:00.000Z'),
        tab(3, 'Clausen', 0, null),
        tab(4, 'Dorn', 1, '2026-11-03T10:00:00.000Z'),
      ],
      [
        enrollment(11, 1, 'Albers'),
        enrollment(12, 2, 'Berg'),
        enrollment(13, 3, 'Clausen', true),
        enrollment(14, 4, 'Dorn', true),
        enrollment(15, 5, 'Ebert'),
      ],
      NOW,
    );

    expect(roster.map((row) => [row.person.personId, row.state, row.enrollmentId])).toEqual([
      [2, 'overdue', 12],
      [1, 'open', 11],
      [4, 'open', null],
      [5, 'paid', 15],
    ]);
  });
});

describe('hubSummaryOf', () => {
  it.each([
    ['2026-11-10', true],
    ['2026-11-20', false],
    [null, false],
  ])('projected empty on %s warns: %s', (projectedEmptyOn, warns) => {
    const summary = hubSummaryOf({
      stock: {
        crates: 4,
        forecast: { paceWindowDays: 21, cratesTakenInPaceWindow: 9, projectedEmptyOn },
        movements: [],
      },
      crates: [],
      roster: [],
      now: NOW,
    });

    expect(summary.warns).toBe(warns);
  });
});

describe('journalOf', () => {
  it('groups crates booked together into one line and keeps undone payments struck', () => {
    const entries = journalOf({
      journal: {
        crates: [
          crate(1, 1, '2026-11-03T10:00:00.000Z'),
          crate(2, 1, '2026-11-03T10:00:00.000Z'),
          crate(3, 1, '2026-11-04T10:00:00.000Z'),
        ],
        payments: [
          {
            beerPaymentId: 7,
            person: person(1, 'P', '1'),
            crates: 2,
            amountCents: 3000,
            bookedAt: '2026-11-04T12:00:00.000Z',
            bookedBy: null,
            undoneAt: '2026-11-04T12:01:00.000Z',
          },
        ],
      },
      movements: [],
      enrollments: [enrollment(11, 1, 'Albers')],
      since: '2026-06-01T00:00:00.000Z',
    });

    expect(entries.map((entry) => [entry.kind, entry.count, entry.undone])).toEqual([
      ['payment', 2, true],
      ['crate', 1, false],
      ['crate', 2, false],
    ]);
  });
});

describe('bookableOf', () => {
  it('offers everyone who ever enrolled once, running enrollees first', () => {
    const bookable = bookableOf([
      enrollment(1, 1, 'Albers', true),
      enrollment(2, 2, 'Berg'),
      enrollment(3, 1, 'Albers'),
      enrollment(4, 3, 'Clausen', true),
    ]);

    expect(bookable.map((entry) => [entry.person.personId, entry.enrolled])).toEqual([
      [1, true],
      [2, true],
      [3, false],
    ]);
  });
});

describe('tileEuroOf', () => {
  it.each([
    [17_200, '172,00 €'],
    [99_999, '999,99 €'],
    [123_400, '1.234 €'],
    [123_450, '1.235 €'],
  ])('shows %i cents as %s', (cents, expected) => {
    expect(tileEuroOf(cents)).toBe(expected);
  });
});
