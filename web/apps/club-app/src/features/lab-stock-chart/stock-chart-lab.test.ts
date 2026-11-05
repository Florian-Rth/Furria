import { describe, expect, it } from 'vitest';
import type { BeerHubSummary } from '@/features/manage-beer-list/beer-hub';
import { deliveriesOf, labSummaryOf, runwayReadoutOf } from './stock-chart-lab';

const summary: BeerHubSummary = {
  stock: 19,
  emptyOn: '2026-11-27',
  daysLeft: 21.6,
  warns: false,
  openCents: 0,
  openTabs: 0,
  overdue: 0,
  enrolled: 0,
  paceWindowDays: 28,
  series: [20, 19],
  seriesFromOn: '2026-11-04',
};
const now = '2026-11-05T12:00:00.000Z';

describe('labSummaryOf', () => {
  it.each([
    { state: 'real', emptyOn: '2026-11-27', daysLeft: 21.6, warns: false },
    { state: 'warn', emptyOn: '2026-11-10', daysLeft: 5, warns: true },
    { state: 'still', emptyOn: null, daysLeft: null, warns: false },
    { state: 'long', emptyOn: '2027-01-04', daysLeft: 60, warns: false },
  ] as const)('forces the $state state', ({ state, emptyOn, daysLeft, warns }) => {
    expect(labSummaryOf(summary, state, now)).toMatchObject({ emptyOn, daysLeft, warns });
  });
});

describe('deliveriesOf', () => {
  const movementOf = (
    kind: 'delivery' | 'correction' | 'handoverCarry',
    crates: number,
    bookedAt: string,
  ) => ({
    movementId: 1,
    kind,
    crates,
    bookedAt,
    bookedBy: null,
  });

  it('sums the restocks of each day and ignores corrections', () => {
    expect(
      deliveriesOf(
        [
          movementOf('delivery', 10, '2026-11-03T13:00:00.000Z'),
          movementOf('handoverCarry', 4, '2026-11-03T20:00:00.000Z'),
          movementOf('correction', 2, '2026-11-04T13:00:00.000Z'),
          movementOf('delivery', -1, '2026-11-05T09:00:00.000Z'),
          movementOf('delivery', 6, '2026-11-05T11:00:00.000Z'),
          movementOf('delivery', 9, '2026-10-01T11:00:00.000Z'),
        ],
        now,
        3,
      ),
    ).toEqual([0, 14, 6]);
  });
});

describe('runwayReadoutOf', () => {
  it.each([
    { daysLeft: 21.6, stock: 19, value: '22' },
    { daysLeft: null, stock: 19, value: '—' },
    { daysLeft: 3, stock: 0, value: '—' },
  ])('reads $daysLeft days of $stock crates', ({ daysLeft, stock, value }) => {
    expect(runwayReadoutOf({ ...summary, daysLeft, stock }).value).toBe(value);
  });
});
