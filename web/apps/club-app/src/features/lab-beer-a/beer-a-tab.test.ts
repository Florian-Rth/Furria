import { describe, expect, it } from 'vitest';
import type { LabBeerTab } from '@/features/lab-beer/beer-lab-types';
import { historyOf, openStrokesOf, settlePlanOf, tabStrokesOf } from './beer-a-tab';

const NOW = '2026-11-04T18:40:00.000Z';

const payment = (id: number, crateCount: number, bookedAt: string) => ({
  id,
  personId: 4,
  crateCount,
  bookedById: 1,
  bookedAt,
});

const crate = (id: number, bookedAt: string, priceCents = 1800) => ({
  id,
  personId: 4,
  priceCents,
  enteredById: 4,
  bookedAt,
  undoneAt: null,
});

const firstPayment = payment(1, 2, '2026-10-10T18:00:00.000Z');
const secondPayment = payment(2, 1, '2026-10-20T18:00:00.000Z');

const tab: LabBeerTab = {
  personId: 4,
  crates: [
    { crate: crate(1, '2026-09-20T18:00:00.000Z', 1700), paidBy: firstPayment },
    { crate: crate(2, '2026-09-25T18:00:00.000Z', 1700), paidBy: firstPayment },
    { crate: crate(3, '2026-10-12T18:00:00.000Z'), paidBy: secondPayment },
    { crate: crate(4, '2026-10-15T18:00:00.000Z', 1700), paidBy: null },
    { crate: crate(5, '2026-11-01T18:00:00.000Z'), paidBy: null },
    { crate: crate(6, '2026-11-04T18:39:00.000Z'), paidBy: null },
  ],
  openCount: 3,
  openCents: 5300,
  paidCount: 3,
  oldestOpenAt: '2026-10-15T18:00:00.000Z',
};

describe('tabStrokesOf', () => {
  it('marks paid, overdue, open and freshly booked crates', () => {
    expect(tabStrokesOf(tab, NOW, [6])).toEqual([
      'paid',
      'paid',
      'paid',
      'overdue',
      'open',
      'fresh',
    ]);
  });
});

describe('openStrokesOf', () => {
  it('keeps only open crates', () => {
    expect(openStrokesOf(tab, NOW)).toEqual(['overdue', 'open', 'open']);
  });
});

describe('historyOf', () => {
  it('groups open crates first, then payments newest first', () => {
    const groups = historyOf(tab);

    expect(
      groups.map((group) => ({
        kind: group.kind,
        ids: group.crates.map((entry) => entry.crate.id),
        cents: group.cents,
      })),
    ).toEqual([
      { kind: 'open', ids: [6, 5, 4], cents: 5300 },
      { kind: 'paid', ids: [3], cents: 1800 },
      { kind: 'paid', ids: [2, 1], cents: 3400 },
    ]);
  });

  it('has no open group when everything is paid', () => {
    const paidOnly: LabBeerTab = { ...tab, crates: tab.crates.slice(0, 3), openCount: 0 };

    expect(historyOf(paidOnly).map((group) => group.kind)).toEqual(['paid', 'paid']);
  });
});

describe('settlePlanOf', () => {
  it.each([
    [1, [4], [5, 6], 1700],
    [2, [4, 5], [6], 3500],
    [3, [4, 5, 6], [], 5300],
    [9, [4, 5, 6], [], 5300],
  ])('settles %i crates oldest first', (count, settles, stays, cents) => {
    const plan = settlePlanOf(tab, count);

    expect({
      settles: plan.settles.map((entry) => entry.crate.id),
      stays: plan.stays.map((entry) => entry.crate.id),
      cents: plan.cents,
    }).toEqual({ settles, stays, cents });
  });
});
