import { describe, expect, it } from 'vitest';
import { historyGroupsOf, payeesOf, tabStrokesOf, tabTotalsOf } from './beer-tab';
import type { BeerTabCrate, BeerTabPot } from './schemas';

const NOW = Date.parse('2026-11-04T12:00:00Z');

const crate = (
  crateId: number,
  bookedAt: string,
  paidAt: string | null = null,
  priceCents = 1500,
): BeerTabCrate => ({ crateId, priceCents, bookedAt, enteredBy: null, paidAt });

const pot = (
  beerPotId: number,
  isOpen: boolean,
  crates: BeerTabCrate[],
  paymentLink: string | null = null,
): BeerTabPot => ({
  beerPotId,
  isOpen,
  openedAt: '2026-01-01T00:00:00Z',
  owner: null,
  paymentLink,
  openCrates: 0,
  openCents: 0,
  paidCrates: 0,
  paidCents: 0,
  crates,
});

describe('tabStrokesOf', () => {
  it('draws every crate oldest first: paid, fresh, a week old and newer', () => {
    const pots = [
      pot(2, true, [
        crate(9, '2026-11-04T10:00:00Z'),
        crate(4, '2026-10-28T12:00:00Z'),
        crate(5, '2026-10-28T12:00:01Z'),
      ]),
      pot(1, false, [crate(1, '2026-09-01T10:00:00Z', '2026-09-10T10:00:00Z')]),
    ];

    expect(tabStrokesOf(pots, NOW, [9])).toEqual(['paid', 'overdue', 'open', 'fresh']);
  });
});

describe('tabTotalsOf', () => {
  it('sums the open crates of every pot and finds the oldest', () => {
    const pots = [
      pot(2, true, [crate(9, '2026-11-02T10:00:00Z', null, 1800)]),
      pot(1, false, [
        crate(3, '2026-10-01T10:00:00Z'),
        crate(1, '2026-09-01T10:00:00Z', '2026-09-10T10:00:00Z'),
      ]),
    ];

    expect(tabTotalsOf(pots)).toEqual({
      openCents: 3300,
      openCount: 2,
      paidCount: 1,
      oldestOpenAt: '2026-10-01T10:00:00Z',
    });
  });

  it('has nothing open on a settled tab', () => {
    const pots = [pot(2, true, [crate(1, '2026-09-01T10:00:00Z', '2026-09-10T10:00:00Z')])];

    expect(tabTotalsOf(pots)).toEqual({
      openCents: 0,
      openCount: 0,
      paidCount: 1,
      oldestOpenAt: null,
    });
  });
});

describe('historyGroupsOf', () => {
  it('lists open crates per pot first, then payments newest first', () => {
    const pots = [
      pot(2, true, [
        crate(8, '2026-11-01T10:00:00Z'),
        crate(9, '2026-11-03T10:00:00Z'),
        crate(7, '2026-10-20T10:00:00Z', '2026-10-25T10:00:00Z'),
      ]),
      pot(1, false, [
        crate(3, '2026-09-20T10:00:00Z'),
        crate(1, '2026-09-01T10:00:00Z', '2026-09-10T10:00:00Z'),
        crate(2, '2026-09-02T10:00:00Z', '2026-09-10T10:00:00Z'),
      ]),
    ];

    const shape = historyGroupsOf(pots).map((group) => ({
      kind: group.kind,
      crateIds: group.crates.map((entry) => entry.crateId),
      cents: group.cents,
    }));

    expect(shape).toEqual([
      { kind: 'open', crateIds: [9, 8], cents: 3000 },
      { kind: 'open', crateIds: [3], cents: 1500 },
      { kind: 'paid', crateIds: [7], cents: 1500 },
      { kind: 'paid', crateIds: [2, 1], cents: 3000 },
    ]);
  });
});

describe('payeesOf', () => {
  it.each([
    ['https://paypal.me/sabine', 'https://paypal.me/sabine/33.00EUR'],
    [null, null],
  ])('asks for the open amount of each owing pot via %s', (link, payHref) => {
    const pots = [
      pot(
        2,
        true,
        [crate(9, '2026-11-02T10:00:00Z', null, 1800), crate(8, '2026-11-01T10:00:00Z')],
        link,
      ),
      pot(1, false, [crate(1, '2026-09-01T10:00:00Z', '2026-09-10T10:00:00Z')]),
    ];

    expect(payeesOf(pots).map((payee) => [payee.potId, payee.openCents, payee.payHref])).toEqual([
      [2, 3300, payHref],
    ]);
  });
});
