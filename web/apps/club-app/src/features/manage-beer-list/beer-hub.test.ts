import { describe, expect, it } from 'vitest';
import {
  centsOfPriceText,
  crateStateOf,
  drinkTrendsOf,
  openCratesOf,
  paidDrinksOf,
  paymentPreviewOf,
  rosterOf,
  stockSeriesOf,
} from './beer-hub';

const NOW = '2026-11-04T18:00:00.000Z';

describe('centsOfPriceText', () => {
  it.each([
    ['17.5', 1750],
    ['16,95 €', 1695],
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
  beerDrinkId: 1,
  drinkName: 'Bier',
  person: person(personId, 'P', `${personId}`),
  priceCents: extra.priceCents ?? 1500,
  bookedAt,
  enteredBy: person(personId, 'P', `${personId}`),
  undoneAt: extra.undoneAt ?? null,
  beerPaymentId: extra.beerPaymentId ?? null,
});

describe('openCratesOf', () => {
  it('keeps the open crates of the person, oldest first', () => {
    const crates = [
      crate(4, 1, '2026-11-03T10:00:00.000Z'),
      crate(3, 1, '2026-10-20T10:00:00.000Z'),
      crate(2, 1, '2026-10-10T10:00:00.000Z', { beerPaymentId: 9 }),
      crate(5, 1, '2026-10-01T10:00:00.000Z', { undoneAt: '2026-10-01T10:00:05.000Z' }),
      crate(6, 2, '2026-09-01T10:00:00.000Z'),
    ];

    expect(openCratesOf(crates, 1).map((entry) => entry.crateId)).toEqual([3, 4]);
  });
});

const openCrate = (
  crateId: number,
  beerDrinkId: number,
  drinkName: string,
  priceCents: number,
) => ({
  crateId,
  beerDrinkId,
  drinkName,
  person: person(1, 'P', '1'),
  priceCents,
  bookedAt: `2026-10-0${crateId}T10:00:00.000Z`,
  enteredBy: null,
  undoneAt: null,
  beerPaymentId: null,
});

const OLDEST_FIRST = [
  openCrate(1, 1, 'Veltins', 1300),
  openCrate(2, 2, 'Radler', 1600),
  openCrate(3, 1, 'Veltins', 1500),
  openCrate(4, 1, 'Veltins', 1800),
];

describe('paymentPreviewOf', () => {
  it.each([
    [[{ beerDrinkId: 1, crates: 2 }], [1, 3], 2, 2800, false],
    [
      [
        { beerDrinkId: 1, crates: 3 },
        { beerDrinkId: 2, crates: 1 },
      ],
      [1, 2, 3, 4],
      4,
      6200,
      true,
    ],
    [[{ beerDrinkId: 1, crates: 9 }], [1, 3, 4], 3, 4600, false],
  ])('picks %j settle %j: %i crates, %i cents, full %s', (picks, settled, crates, cents, full) => {
    const preview = paymentPreviewOf(OLDEST_FIRST, picks);

    expect(preview.lines.filter((line) => line.settled).map((line) => line.crate.crateId)).toEqual(
      settled,
    );
    expect([preview.crates, preview.cents, preview.full]).toEqual([crates, cents, full]);
  });
});

const PAYMENT_ROWS = [
  { beerDrinkId: 1, name: 'Veltins', open: 3 },
  { beerDrinkId: 2, name: 'Radler', open: 1 },
];

describe('paidDrinksOf', () => {
  it.each([
    [
      [
        { beerDrinkId: 2, crates: 1 },
        { beerDrinkId: 1, crates: 5 },
      ],
      [
        { beerDrinkId: 1, crates: 3 },
        { beerDrinkId: 2, crates: 1 },
      ],
    ],
  ])('picks %j → request drinks %j', (picks, expected) => {
    expect(paidDrinksOf(PAYMENT_ROWS, picks)).toEqual(expected);
  });
});

describe('crateStateOf', () => {
  it.each([
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
        beerDrinkId: 1,
        drinkName: 'Bier',
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

const drink = (
  beerDrinkId: number,
  name: string,
  crates: number,
  projectedEmptyOn: string | null,
  isRetired = false,
  isDefault = false,
) => ({
  beerDrinkId,
  name,
  cratePriceCents: 1800,
  isRetired,
  isDefault,
  crates,
  forecast: { paceWindowDays: 21, cratesTakenInPaceWindow: 9, projectedEmptyOn },
});

describe('drinkTrendsOf', () => {
  it('tracks each listed drink on its own and leaves retired drinks out', () => {
    const movementOf = (
      movementId: number,
      beerDrinkId: number,
      crates: number,
      bookedAt: string,
    ) => ({
      movementId,
      beerDrinkId,
      drinkName: '',
      kind: 'delivery' as const,
      crates,
      bookedAt,
      bookedBy: null,
    });
    const trends = drinkTrendsOf(
      {
        drinks: [
          drink(1, 'Veltins', 8, '2026-11-08'),
          drink(2, 'Radler', 5, null),
          drink(3, 'Helles', 0, null, true),
        ],
        movements: [
          movementOf(1, 1, 10, '2026-11-01T10:00:00.000Z'),
          movementOf(2, 2, 5, '2026-11-03T10:00:00.000Z'),
          movementOf(3, 3, 4, '2026-11-01T10:00:00.000Z'),
        ],
      },
      [crate(1, 1, '2026-11-02T10:00:00.000Z'), crate(2, 1, '2026-11-02T11:00:00.000Z')],
      NOW,
    );

    expect(
      trends.map((trend) => [trend.beerDrinkId, trend.series.slice(-5), trend.outlook.warns]),
    ).toEqual([
      [1, [0, 10, 8, 8, 8], true],
      [2, [0, 0, 0, 5, 5], false],
    ]);
  });
});
