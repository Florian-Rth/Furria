import { describe, expect, it } from 'vitest';
import type { LabBeerPayment, LabBeerTab } from '@/features/lab-beer/beer-lab-types';
import { ledgerHeadOf, monthsOf, statementOf } from './ledger-statement';

const crate = (id: number, bookedAt: string, priceCents = 1800, enteredById = 3) => ({
  id,
  personId: 3,
  priceCents,
  enteredById,
  bookedAt,
  undoneAt: null,
});

const payment: LabBeerPayment = {
  id: 7,
  personId: 3,
  crateCount: 2,
  bookedById: 1,
  bookedAt: '2026-10-20T18:00:00.000Z',
};

const tab: LabBeerTab = {
  personId: 3,
  crates: [
    { crate: crate(1, '2026-10-01T18:00:00.000Z', 1700), paidBy: payment },
    { crate: crate(2, '2026-10-10T18:00:00.000Z'), paidBy: payment },
    { crate: crate(3, '2026-10-25T18:00:00.000Z', 1800, 2), paidBy: null },
    { crate: crate(4, '2026-11-02T18:00:00.000Z'), paidBy: null },
  ],
  openCount: 2,
  openCents: 3600,
  paidCount: 2,
  oldestOpenAt: '2026-10-25T18:00:00.000Z',
};

describe('statementOf', () => {
  const entries = statementOf(tab, [payment]);

  it('lists newest first with a running open balance', () => {
    expect(entries.map((entry) => [entry.key, entry.balanceCents])).toEqual([
      ['crate-4', 3600],
      ['crate-3', 1800],
      ['payment-7', 0],
      ['crate-2', 3500],
      ['crate-1', 1700],
    ]);
  });

  it('brackets a payment with the crates it settled', () => {
    expect(entries.map((entry) => entry.rail)).toEqual(['none', 'none', 'top', 'middle', 'bottom']);
  });

  it('sums the settled crates at their own prices', () => {
    expect(entries[2]).toMatchObject({
      cents: 3500,
      firstCrateAt: '2026-10-01T18:00:00.000Z',
      lastCrateAt: '2026-10-10T18:00:00.000Z',
    });
  });

  it('names the enterer only when someone else entered the crate', () => {
    expect(entries.slice(0, 2).map((entry) => entry.kind === 'crate' && entry.enteredById)).toEqual(
      [null, 2],
    );
  });

  it('never leaves a bracket without its payment inside a month', () => {
    expect(monthsOf(entries).map((month) => month.entries.map((entry) => entry.rail))).toEqual([
      ['none'],
      ['none', 'top', 'middle', 'bottom'],
    ]);
  });

  it('drops a bracket cut off from its payment', () => {
    const late: LabBeerPayment = { ...payment, bookedAt: '2026-11-01T18:00:00.000Z' };
    const split: LabBeerTab = {
      ...tab,
      crates: tab.crates.map((entry) =>
        entry.paidBy === null ? entry : { ...entry, paidBy: late },
      ),
    };

    expect(
      monthsOf(statementOf(split, [late])).map((month) => month.entries.map((entry) => entry.rail)),
    ).toEqual([
      ['none', 'none'],
      ['none', 'none', 'none'],
    ]);
  });

  it('groups entries by month and counts crates', () => {
    expect(monthsOf(entries).map((month) => [month.key, month.crateCount])).toEqual([
      ['2026-11', 1],
      ['2026-10', 3],
    ]);
  });
});

describe('ledgerHeadOf', () => {
  it.each([
    ['2026-10-30T18:00:00.000Z', 'open', 5],
    ['2026-11-04T18:00:00.000Z', 'overdue', 10],
  ])('at %s the tab is %s', (now, status, days) => {
    expect(ledgerHeadOf(tab, now)).toMatchObject({ status, openDays: days });
  });

  it.each([
    [{ ...tab, crates: [], openCount: 0, openCents: 0, paidCount: 0, oldestOpenAt: null }, 'none'],
    [{ ...tab, openCount: 0, openCents: 0, oldestOpenAt: null }, 'clear'],
  ])('reads a tab without open crates', (quiet, status) => {
    expect(ledgerHeadOf(quiet, '2026-11-04T18:00:00.000Z').status).toBe(status);
  });
});
