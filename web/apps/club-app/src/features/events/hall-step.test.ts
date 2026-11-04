import { describe, expect, it } from 'vitest';
import type { PlannedEvent } from './event-plan';
import { hallChecksOf, tablePlanNeedOfferOf } from './hall-step';

type HallEvent = Pick<PlannedEvent, 'tablePlan' | 'withoutTablePlan' | 'isOver' | 'status'>;

const event = (overrides: Partial<HallEvent> = {}): HallEvent => ({
  tablePlan: null,
  withoutTablePlan: false,
  isOver: false,
  status: 'presaleScheduled',
  ...overrides,
});

describe('hallChecksOf', () => {
  it.each([
    { name: 'no plan', overrides: {}, planState: 'open', tablesState: 'open', skipped: false },
    {
      name: 'not needed',
      overrides: { withoutTablePlan: true },
      planState: 'off',
      tablesState: 'off',
      skipped: true,
    },
    {
      name: 'an empty plan',
      overrides: { tablePlan: { tables: 0, chairs: 0 } },
      planState: 'done',
      tablesState: 'open',
      skipped: false,
    },
    {
      name: 'a plan with tables',
      overrides: { tablePlan: { tables: 12, chairs: 96 } },
      planState: 'done',
      tablesState: 'done',
      skipped: false,
    },
  ])('$name', ({ overrides, planState, tablesState, skipped }) => {
    const checks = hallChecksOf(event(overrides));

    expect([checks.planState, checks.tablesState, checks.skipped]).toEqual([
      planState,
      tablesState,
      skipped,
    ]);
  });
});

describe('tablePlanNeedOfferOf', () => {
  it.each([
    { name: 'no plan yet', overrides: {}, plansHall: true, offer: 'drop' },
    { name: 'dropped', overrides: { withoutTablePlan: true }, plansHall: true, offer: 'restore' },
    {
      name: 'a plan exists',
      overrides: { tablePlan: { tables: 1, chairs: 8 } },
      plansHall: true,
      offer: null,
    },
    { name: 'evening over', overrides: { isOver: true }, plansHall: true, offer: null },
    {
      name: 'cancelled',
      overrides: { status: 'cancelled' as const },
      plansHall: true,
      offer: null,
    },
    { name: 'no right', overrides: {}, plansHall: false, offer: null },
  ])('$name', ({ overrides, plansHall, offer }) => {
    expect(tablePlanNeedOfferOf(event(overrides), plansHall)).toBe(offer);
  });
});
