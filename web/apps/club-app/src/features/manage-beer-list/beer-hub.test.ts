import { describe, expect, it } from 'vitest';
import {
  bookableOf,
  centsOfPriceText,
  crateStateOf,
  drinkLimitsOf,
  drinkTrendsOf,
  fullPaymentOf,
  hubSummaryOf,
  initialDrinkOf,
  initialStockDrinkOf,
  journalOf,
  leadDrinkOf,
  openCratesOf,
  paidDrinksOf,
  paymentPreviewOf,
  paymentRowsOf,
  rosterOf,
  signedCountOfText,
  steppedPaymentOf,
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

describe('paymentRowsOf', () => {
  it('lists each drink once with its open count, in order of its oldest crate', () => {
    expect(paymentRowsOf(OLDEST_FIRST)).toEqual([
      { beerDrinkId: 1, name: 'Veltins', open: 3 },
      { beerDrinkId: 2, name: 'Radler', open: 1 },
    ]);
  });
});

describe('paymentPreviewOf', () => {
  it.each([
    [[], [], 0, 0, false],
    [[{ beerDrinkId: 1, crates: 1 }], [1], 1, 1300, false],
    [[{ beerDrinkId: 1, crates: 2 }], [1, 3], 2, 2800, false],
    [[{ beerDrinkId: 2, crates: 1 }], [2], 1, 1600, false],
    [
      [
        { beerDrinkId: 1, crates: 1 },
        { beerDrinkId: 2, crates: 1 },
      ],
      [1, 2],
      2,
      2900,
      false,
    ],
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
    [[{ beerDrinkId: 7, crates: 2 }], [], 0, 0, false],
  ])('picks %j settle %j: %i crates, %i cents, full %s', (picks, settled, crates, cents, full) => {
    const preview = paymentPreviewOf(OLDEST_FIRST, picks);

    expect(preview.lines.filter((line) => line.settled).map((line) => line.crate.crateId)).toEqual(
      settled,
    );
    expect([preview.crates, preview.cents, preview.full]).toEqual([crates, cents, full]);
  });

  it('pairs every drink row with its picked count', () => {
    const preview = paymentPreviewOf(OLDEST_FIRST, [{ beerDrinkId: 2, crates: 1 }]);

    expect(preview.drinks.map((drink) => [drink.beerDrinkId, drink.crates, drink.open])).toEqual([
      [1, 0, 3],
      [2, 1, 1],
    ]);
  });
});

const PAYMENT_ROWS = [
  { beerDrinkId: 1, name: 'Veltins', open: 3 },
  { beerDrinkId: 2, name: 'Radler', open: 1 },
];

describe('steppedPaymentOf', () => {
  it.each([
    [[], 1, 1, [1, 0]],
    [[{ beerDrinkId: 1, crates: 3 }], 1, 1, [3, 0]],
    [[{ beerDrinkId: 1, crates: 2 }], 1, -1, [1, 0]],
    [[], 1, -1, [0, 0]],
    [[{ beerDrinkId: 1, crates: 2 }], 2, 1, [2, 1]],
    [[{ beerDrinkId: 2, crates: 1 }], 2, 1, [0, 1]],
  ])('picks %j, drink %i, step %i → %j', (picks, beerDrinkId, step, expected) => {
    expect(
      steppedPaymentOf(PAYMENT_ROWS, picks, beerDrinkId, step).map((pick) => pick.crates),
    ).toEqual(expected);
  });
});

describe('fullPaymentOf', () => {
  it('picks every open crate of every drink', () => {
    expect(fullPaymentOf(PAYMENT_ROWS)).toEqual([
      { beerDrinkId: 1, crates: 3 },
      { beerDrinkId: 2, crates: 1 },
    ]);
  });
});

describe('paidDrinksOf', () => {
  it.each([
    [[], []],
    [
      [
        { beerDrinkId: 1, crates: 0 },
        { beerDrinkId: 2, crates: 1 },
      ],
      [{ beerDrinkId: 2, crates: 1 }],
    ],
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
    [[{ beerDrinkId: 9, crates: 2 }], []],
  ])('picks %j → request drinks %j', (picks, expected) => {
    expect(paidDrinksOf(PAYMENT_ROWS, picks)).toEqual(expected);
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

describe('leadDrinkOf', () => {
  it.each([
    [
      'the drink running out soonest leads',
      [drink(1, 'Veltins', 9, '2026-11-20'), drink(2, 'Radler', 3, '2026-11-08')],
      2,
    ],
    [
      'a drink with a forecast leads one without',
      [drink(1, 'Veltins', 1, null), drink(2, 'Radler', 30, '2026-12-08')],
      2,
    ],
    [
      'without forecasts the smallest stock leads',
      [drink(1, 'Veltins', 6, null), drink(2, 'Radler', 2, null)],
      2,
    ],
    [
      'a retired drink never leads',
      [drink(1, 'Veltins', 6, '2026-12-01'), drink(2, 'Radler', 0, '2026-11-05', true)],
      1,
    ],
    ['nothing listed has no lead', [drink(2, 'Radler', 0, null, true)], null],
  ])('%s', (_label, drinks, expected) => {
    expect(leadDrinkOf(drinks)?.beerDrinkId ?? null).toBe(expected);
  });
});

describe('drinkLimitsOf and initialDrinkOf', () => {
  it.each([
    [
      'caps a booking at the drink stock and at twenty',
      [drink(1, 'Veltins', 3, null), drink(2, 'Radler', 40, null)],
      [
        { beerDrinkId: 1, maxCount: 3 },
        { beerDrinkId: 2, maxCount: 20 },
      ],
      '',
    ],
    [
      'leaves out empty and retired drinks and preselects the one left',
      [
        drink(1, 'Veltins', 0, null),
        drink(2, 'Radler', 5, null),
        drink(3, 'Helles', 4, null, true),
      ],
      [{ beerDrinkId: 2, maxCount: 5 }],
      '2',
    ],
    [
      'preselects the default drink in stock',
      [drink(1, 'Veltins', 3, null), drink(2, 'Radler', 5, null, false, true)],
      [
        { beerDrinkId: 1, maxCount: 3 },
        { beerDrinkId: 2, maxCount: 5 },
      ],
      '2',
    ],
    [
      'skips a sold-out default for the only drink in stock',
      [drink(1, 'Veltins', 3, null), drink(2, 'Radler', 0, null, false, true)],
      [{ beerDrinkId: 1, maxCount: 3 }],
      '1',
    ],
  ])('%s', (_label, drinks, limits, initial) => {
    expect(drinkLimitsOf(drinks)).toEqual(limits);
    expect(initialDrinkOf(drinks)).toBe(initial);
  });
});

describe('initialStockDrinkOf', () => {
  it.each([
    [
      'the default drink even when it is empty',
      [drink(1, 'Veltins', 3, null), drink(2, 'Radler', 0, null, false, true)],
      '2',
    ],
    [
      'the only listed drink',
      [drink(1, 'Veltins', 0, null), drink(2, 'Radler', 0, null, true)],
      '1',
    ],
    [
      'nothing among several without a default',
      [drink(1, 'Veltins', 3, null), drink(2, 'Radler', 1, null)],
      '',
    ],
  ])('%s', (_label, drinks, expected) => {
    expect(initialStockDrinkOf(drinks)).toBe(expected);
  });
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

describe('hubSummaryOf', () => {
  it.each([
    ['2026-11-10', true],
    ['2026-11-20', false],
    [null, false],
  ])('projected empty on %s warns: %s', (projectedEmptyOn, warns) => {
    const summary = hubSummaryOf({
      stock: { drinks: [drink(1, 'Bier', 4, projectedEmptyOn)], movements: [] },
      crates: [],
      roster: [],
      now: NOW,
    });

    expect(summary.warns).toBe(warns);
  });

  it('sums the listed drinks and names the one running out soonest when there are several', () => {
    const summary = hubSummaryOf({
      stock: {
        drinks: [
          drink(1, 'Veltins', 9, '2026-11-20'),
          drink(2, 'Radler', 3, '2026-11-08'),
          drink(3, 'Helles', 0, null, true),
        ],
        movements: [],
      },
      crates: [],
      roster: [],
      now: NOW,
    });

    expect([summary.stock, summary.leadName, summary.emptyOn, summary.warns]).toEqual([
      12,
      'Radler',
      '2026-11-08',
      true,
    ]);
  });

  it('starts the stock series on the Berlin day sixty days back including today', () => {
    const summary = hubSummaryOf({
      stock: { drinks: [drink(1, 'Bier', 4, null)], movements: [] },
      crates: [],
      roster: [],
      now: '2026-11-04T23:30:00.000Z',
    });

    expect(summary.seriesFromOn).toBe('2026-09-07');
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
            drinks: [{ beerDrinkId: 1, name: 'Bier', crates: 2 }],
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
