import type {
  LabBeerCrate,
  LabBeerEnrollment,
  LabBeerPayment,
  LabBeerPerson,
  LabBeerStockMovement,
  LabBeerWorld,
} from './beer-lab-types';

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const LAB_NOW = '2026-11-04T18:40:00.000Z';
const TODAY_MIDNIGHT_UTC = Date.parse('2026-11-04T00:00:00.000Z');
const PRICE_CHANGE_DAYS_AGO = 30;
const OLD_PRICE_CENTS = 1700;
const PRICE_CENTS = 1800;

const SABINE = 1;
const FRANK = 2;

export const LAB_BEER_PERSONS: readonly LabBeerPerson[] = [
  { id: 1, firstName: 'Sabine', lastName: 'Roth', initials: 'SR' },
  { id: 2, firstName: 'Frank', lastName: 'Weber', initials: 'FW' },
  { id: 3, firstName: 'Lena', lastName: 'Brandt', initials: 'LB' },
  { id: 4, firstName: 'Kevin', lastName: 'Maurer', initials: 'KM' },
  { id: 5, firstName: 'Gerd', lastName: 'Lang', initials: 'GL' },
  { id: 6, firstName: 'Jana', lastName: 'Kühn', initials: 'JK' },
  { id: 7, firstName: 'Tobias', lastName: 'Schäfer', initials: 'TS' },
  { id: 8, firstName: 'Marie', lastName: 'Hoffmann', initials: 'MH' },
  { id: 9, firstName: 'Jonas', lastName: 'Becker', initials: 'JB' },
  { id: 10, firstName: 'Dieter', lastName: 'Wolf', initials: 'DW' },
  { id: 11, firstName: 'Paul', lastName: 'Schmitt', initials: 'PS' },
  { id: 12, firstName: 'Anna', lastName: 'Klein', initials: 'AK' },
  { id: 13, firstName: 'Nina', lastName: 'Hartmann', initials: 'NH' },
];

export const LAB_BEER_VIEWERS = {
  openTab: 3,
  bigDebt: 4,
  allPaid: 11,
  former: 10,
  fresh: 12,
  notEnrolled: 13,
  owner: SABINE,
  operator: FRANK,
} as const;

export type LabBeerViewerKey = keyof typeof LAB_BEER_VIEWERS;

interface PersonHistory {
  personId: number;
  enrolledDaysAgo: number;
  crateDaysAgo: readonly number[];
  payments: readonly (readonly [daysAgo: number, crateCount: number])[];
  enteredByOthers?: readonly (readonly [daysAgo: number, enteredById: number])[];
  endedDaysAgo?: number;
}

const HISTORIES: readonly PersonHistory[] = [
  {
    personId: 1,
    enrolledDaysAgo: 60,
    crateDaysAgo: [58, 51, 44, 37, 30, 23, 16, 9, 2],
    payments: [
      [30, 5],
      [9, 3],
    ],
  },
  {
    personId: 2,
    enrolledDaysAgo: 60,
    crateDaysAgo: [57, 52, 45, 40, 33, 26, 19, 12, 5, 1],
    payments: [
      [40, 4],
      [19, 3],
      [5, 2],
    ],
  },
  {
    personId: 3,
    enrolledDaysAgo: 59,
    crateDaysAgo: [56, 49, 42, 35, 28, 21, 14, 13, 7, 4, 0],
    payments: [
      [42, 3],
      [28, 2],
      [14, 2],
    ],
  },
  {
    personId: 4,
    enrolledDaysAgo: 58,
    crateDaysAgo: [55, 48, 46, 41, 34, 32, 27, 20, 18, 11, 6, 3],
    payments: [[48, 1]],
    enteredByOthers: [[11, FRANK]],
  },
  {
    personId: 5,
    enrolledDaysAgo: 60,
    crateDaysAgo: [54, 47, 39, 31, 24, 17, 10, 3],
    payments: [
      [39, 3],
      [17, 3],
      [3, 2],
    ],
    enteredByOthers: [[17, FRANK]],
  },
  {
    personId: 6,
    enrolledDaysAgo: 57,
    crateDaysAgo: [53, 43, 36, 29, 22, 15, 8],
    payments: [[22, 5]],
  },
  {
    personId: 7,
    enrolledDaysAgo: 52,
    crateDaysAgo: [50, 38, 25, 13, 6, 2],
    payments: [[25, 3]],
  },
  {
    personId: 8,
    enrolledDaysAgo: 48,
    crateDaysAgo: [47, 33, 19, 5],
    payments: [
      [33, 2],
      [19, 1],
    ],
  },
  {
    personId: 9,
    enrolledDaysAgo: 45,
    crateDaysAgo: [44, 31, 26, 18, 9, 4, 1],
    payments: [
      [26, 3],
      [9, 2],
    ],
  },
  {
    personId: 10,
    enrolledDaysAgo: 60,
    crateDaysAgo: [52, 45, 36, 29, 24],
    payments: [[36, 2]],
    enteredByOthers: [[29, SABINE]],
    endedDaysAgo: 10,
  },
  {
    personId: 11,
    enrolledDaysAgo: 46,
    crateDaysAgo: [42, 28, 20, 11, 2],
    payments: [
      [28, 2],
      [2, 3],
    ],
  },
  { personId: 12, enrolledDaysAgo: 3, crateDaysAgo: [], payments: [] },
];

const eveningOf = (daysAgo: number, salt: number): string => {
  if (daysAgo === 0) {
    return new Date(TODAY_MIDNIGHT_UTC + 18 * HOUR_MS + salt * 60_000).toISOString();
  }

  const hourBerlin = 18 + ((daysAgo * 7 + salt * 3) % 5);
  const minute = (daysAgo * 13 + salt * 7) % 60;

  return new Date(
    TODAY_MIDNIGHT_UTC - daysAgo * DAY_MS + (hourBerlin - 1) * HOUR_MS + minute * 60_000,
  ).toISOString();
};

const enteredByOf = (history: PersonHistory, daysAgo: number): number =>
  history.enteredByOthers?.find(([day]) => day === daysAgo)?.[1] ?? history.personId;

const cratesOf = (): readonly LabBeerCrate[] => {
  const crates = HISTORIES.flatMap((history) =>
    history.crateDaysAgo.map((daysAgo) => ({
      personId: history.personId,
      priceCents: daysAgo > PRICE_CHANGE_DAYS_AGO ? OLD_PRICE_CENTS : PRICE_CENTS,
      enteredById: enteredByOf(history, daysAgo),
      bookedAt: eveningOf(daysAgo, history.personId),
      undoneAt: null,
    })),
  );
  const undone = {
    personId: 9,
    priceCents: PRICE_CENTS,
    enteredById: 9,
    bookedAt: eveningOf(4, 30),
    undoneAt: new Date(Date.parse(eveningOf(4, 30)) + 6_000).toISOString(),
  };

  return [...crates, undone]
    .sort((left, right) => left.bookedAt.localeCompare(right.bookedAt))
    .map((crate, index) => ({ id: index + 1, ...crate }));
};

const paymentsOf = (): readonly LabBeerPayment[] =>
  HISTORIES.flatMap((history) =>
    history.payments.map(([daysAgo, crateCount]) => ({
      personId: history.personId,
      crateCount,
      bookedById: daysAgo % 2 === 0 ? SABINE : FRANK,
      bookedAt: eveningOf(daysAgo, history.personId + 20),
    })),
  )
    .sort((left, right) => left.bookedAt.localeCompare(right.bookedAt))
    .map((payment, index) => ({ id: index + 1, ...payment }));

const enrollmentsOf = (): readonly LabBeerEnrollment[] =>
  HISTORIES.map((history) => ({
    personId: history.personId,
    startedAt: eveningOf(history.enrolledDaysAgo, 40),
    endedAt: history.endedDaysAgo === undefined ? null : eveningOf(history.endedDaysAgo, 41),
    endedById: history.endedDaysAgo === undefined ? null : FRANK,
  }));

const MOVEMENTS: readonly LabBeerStockMovement[] = [
  {
    id: 1,
    kind: 'delivery',
    count: 40,
    reason: null,
    bookedById: SABINE,
    bookedAt: eveningOf(60, 1),
  },
  {
    id: 2,
    kind: 'delivery',
    count: 30,
    reason: null,
    bookedById: SABINE,
    bookedAt: eveningOf(38, 1),
  },
  {
    id: 3,
    kind: 'correction',
    count: -1,
    reason: 'breakage',
    bookedById: FRANK,
    bookedAt: eveningOf(30, 2),
  },
  {
    id: 4,
    kind: 'correction',
    count: 1,
    reason: 'miscount',
    bookedById: SABINE,
    bookedAt: eveningOf(20, 2),
  },
  {
    id: 5,
    kind: 'delivery',
    count: 25,
    reason: null,
    bookedById: SABINE,
    bookedAt: eveningOf(15, 1),
  },
  {
    id: 6,
    kind: 'correction',
    count: -2,
    reason: 'shrinkage',
    bookedById: SABINE,
    bookedAt: eveningOf(6, 2),
  },
];

export const LAB_BEER_WORLD: LabBeerWorld = {
  now: LAB_NOW,
  pot: {
    id: 1,
    ownerId: SABINE,
    priceCents: PRICE_CENTS,
    paymentLink: 'https://paypal.me/SabineRothFurria',
    paymentNote: 'IBAN DE12 5005 0201 0012 3456 78 · Verwendungszweck: Bierliste + Name',
    openedAt: eveningOf(60, 0),
    bookingPath: '/beer-list/book',
  },
  persons: LAB_BEER_PERSONS,
  operatorIds: [SABINE, FRANK],
  enrollments: enrollmentsOf(),
  crates: cratesOf(),
  payments: paymentsOf(),
  movements: MOVEMENTS,
};

export const labBeerPersonOf = (personId: number): LabBeerPerson | null =>
  LAB_BEER_PERSONS.find((person) => person.id === personId) ?? null;
