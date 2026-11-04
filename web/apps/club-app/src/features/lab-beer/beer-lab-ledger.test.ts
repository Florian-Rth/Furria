import { describe, expect, it } from 'vitest';
import {
  euroOf,
  forecastOf,
  giversOf,
  isReminderDue,
  paceOf,
  stockOf,
  tabOf,
} from './beer-lab-ledger';
import type { LabBeerCrate, LabBeerPayment, LabBeerStockMovement } from './beer-lab-types';

const crate = (
  id: number,
  personId: number,
  bookedAt: string,
  priceCents = 1800,
  undoneAt: string | null = null,
): LabBeerCrate => ({ id, personId, priceCents, enteredById: personId, bookedAt, undoneAt });

const payment = (
  id: number,
  personId: number,
  crateCount: number,
  bookedAt: string,
): LabBeerPayment => ({ id, personId, crateCount, bookedById: 1, bookedAt });

describe('tabOf', () => {
  const crates = [
    crate(1, 3, '2026-10-01T19:00:00Z', 1700),
    crate(2, 3, '2026-10-10T19:00:00Z'),
    crate(3, 3, '2026-10-20T19:00:00Z'),
    crate(4, 3, '2026-10-21T19:00:00Z', 1800, '2026-10-21T19:00:05Z'),
    crate(5, 4, '2026-10-02T19:00:00Z'),
  ];

  it('settles the oldest crates first and keeps each crate at its own price', () => {
    const tab = tabOf(3, crates, [payment(1, 3, 1, '2026-10-25T19:00:00Z')]);

    expect(tab).toMatchObject({
      openCount: 2,
      openCents: 3600,
      paidCount: 1,
      oldestOpenAt: '2026-10-10T19:00:00Z',
    });
    expect(tab.crates.map((entry) => [entry.crate.id, entry.paidBy?.id ?? null])).toEqual([
      [1, 1],
      [2, null],
      [3, null],
    ]);
  });

  it('has nothing open once every crate is paid', () => {
    const tab = tabOf(3, crates, [payment(1, 3, 3, '2026-10-25T19:00:00Z')]);

    expect(tab).toMatchObject({ openCount: 0, openCents: 0, paidCount: 3, oldestOpenAt: null });
  });
});

describe('stockOf', () => {
  it('subtracts live crates from the movements', () => {
    const movements: LabBeerStockMovement[] = [
      {
        id: 1,
        kind: 'delivery',
        count: 10,
        reason: null,
        bookedById: 1,
        bookedAt: '2026-10-01T10:00:00Z',
      },
      {
        id: 2,
        kind: 'correction',
        count: -2,
        reason: 'breakage',
        bookedById: 1,
        bookedAt: '2026-10-02T10:00:00Z',
      },
    ];
    const crates = [
      crate(1, 3, '2026-10-03T19:00:00Z'),
      crate(2, 3, '2026-10-03T19:01:00Z', 1800, '2026-10-03T19:01:04Z'),
    ];

    expect(stockOf(movements, crates)).toBe(7);
  });
});

describe('forecast', () => {
  const now = '2026-11-04T18:00:00.000Z';

  it('counts only live crates of the last 21 days into the pace', () => {
    const crates = [
      crate(1, 3, '2026-11-03T19:00:00Z'),
      crate(2, 3, '2026-10-20T19:00:00Z'),
      crate(3, 3, '2026-10-01T19:00:00Z'),
      crate(4, 3, '2026-11-02T19:00:00Z', 1800, '2026-11-02T19:00:03Z'),
    ];

    expect(paceOf(crates, now)).toBeCloseTo(2 / 21);
  });

  it.each([
    { stock: 14, pace: 1, emptyOn: '2026-11-18T18:00:00.000Z', warns: false },
    { stock: 7, pace: 1, emptyOn: '2026-11-11T18:00:00.000Z', warns: true },
    { stock: 3, pace: 0, emptyOn: null, warns: false },
  ])('projects $stock crates at $pace a day to $emptyOn', ({ stock, pace, emptyOn, warns }) => {
    expect(forecastOf(stock, pace, now)).toEqual({ pacePerDay: pace, emptyOn, warns });
  });
});

describe('isReminderDue', () => {
  it.each([
    { oldestOpenAt: null, due: false },
    { oldestOpenAt: '2026-10-30T19:00:00Z', due: false },
    { oldestOpenAt: '2026-10-28T17:00:00Z', due: true },
  ])('is $due for an oldest open crate at $oldestOpenAt', ({ oldestOpenAt, due }) => {
    expect(isReminderDue(oldestOpenAt, '2026-11-04T18:00:00Z')).toBe(due);
  });
});

describe('giversOf', () => {
  it('counts live crates per person, most recent giver first', () => {
    const crates = [
      crate(1, 3, '2026-10-01T19:00:00Z'),
      crate(2, 4, '2026-10-05T19:00:00Z'),
      crate(3, 3, '2026-10-03T19:00:00Z'),
      crate(4, 3, '2026-10-09T19:00:00Z', 1800, '2026-10-09T19:00:02Z'),
    ];

    expect(giversOf(crates)).toEqual([
      { personId: 4, crateCount: 1, lastAt: '2026-10-05T19:00:00Z' },
      { personId: 3, crateCount: 2, lastAt: '2026-10-03T19:00:00Z' },
    ]);
  });
});

describe('euroOf', () => {
  it('formats cents as German euros', () => {
    expect(euroOf(7200).replace(/\s/g, ' ')).toBe('72,00 €');
  });
});
