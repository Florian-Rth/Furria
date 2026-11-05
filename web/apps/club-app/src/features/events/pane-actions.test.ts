import { describe, expect, it } from 'vitest';
import type { PlannedEvent } from './event-plan';
import type { RunningOrderPresence } from './pane-actions';
import { paneActionOf } from './pane-actions';

const TODAY = '2026-10-19';

const planned = (overrides: Partial<PlannedEvent> = {}): PlannedEvent => ({
  eventId: 1,
  startsAt: '2027-01-16T18:11:00Z',
  status: 'presaleScheduled',
  isOver: false,
  publishedAt: '2026-10-01T10:00:00Z',
  createdAt: '2026-10-01T10:00:00Z',
  priceCents: 1900,
  presaleStartsAt: '2026-11-14T10:00:00Z',
  detailsMissing: [],
  steps: [
    { step: 'details', state: 'done', dueOn: '2026-10-18', opensOn: null },
    { step: 'tickets', state: 'open', dueOn: '2026-11-17', opensOn: null },
  ],
  currentStep: 'tickets',
  tablePlan: null,
  withoutTablePlan: false,
  ...overrides,
});

const unpublished = { publishedAt: null };

describe('paneActionOf', () => {
  it.each([
    { name: 'website online → view', pane: 'website' as const, overrides: {}, kind: 'view' },
    {
      name: 'website ready → publish',
      pane: 'website' as const,
      overrides: { ...unpublished, detailsMissing: ['published' as const] },
      kind: 'publish',
    },
    {
      name: 'website blocked → Eckdaten',
      pane: 'website' as const,
      overrides: { ...unpublished, detailsMissing: ['venue' as const, 'published' as const] },
      kind: 'step',
    },
    {
      name: 'missing picture → picture desk',
      pane: 'details' as const,
      overrides: { detailsMissing: ['venue' as const, 'picture' as const] },
      kind: 'picture',
    },
    {
      name: 'missing venue → editor',
      pane: 'details' as const,
      overrides: { detailsMissing: ['venue' as const] },
      kind: 'editDetails',
    },
    {
      name: 'complete and unpublished → publish',
      pane: 'details' as const,
      overrides: { ...unpublished, detailsMissing: ['published' as const] },
      kind: 'publish',
    },
    {
      name: 'missing price → ticket editor',
      pane: 'tickets' as const,
      overrides: { priceCents: null },
      kind: 'editTickets',
    },
    {
      name: 'sold out without a price → nothing left',
      pane: 'tickets' as const,
      overrides: { priceCents: null, status: 'soldOut' as const },
      kind: 'none',
    },
    {
      name: 'missing presale place → ticket editor',
      pane: 'tickets' as const,
      overrides: {},
      kind: 'editTickets',
    },
    {
      name: 'cancelled → nothing',
      pane: 'details' as const,
      overrides: { status: 'cancelled' as const, detailsMissing: ['picture' as const] },
      kind: 'none',
    },
  ])('$name', ({ pane, overrides, kind }) => {
    expect(
      paneActionOf({
        event: planned(overrides),
        pane,
        todayIsoDay: TODAY,
        runningOrder: 'hidden',
        plansHall: false,
      }).kind,
    ).toBe(kind);
  });

  it('moves on to the next pending step once a step is done', () => {
    expect(
      paneActionOf({
        event: planned(),
        pane: 'details',
        todayIsoDay: TODAY,
        runningOrder: 'hidden',
        plansHall: false,
      }),
    ).toEqual({ kind: 'step', pane: 'tickets' });
  });

  it('wraps around to an earlier pending step', () => {
    const event = planned({
      publishedAt: null,
      detailsMissing: ['published'],
      steps: [
        { step: 'details', state: 'done', dueOn: '2026-10-18', opensOn: null },
        { step: 'tickets', state: 'done', dueOn: '2026-11-17', opensOn: null },
      ],
      currentStep: null,
    });

    expect(
      paneActionOf({
        event,
        pane: 'tickets',
        todayIsoDay: TODAY,
        runningOrder: 'hidden',
        plansHall: false,
      }),
    ).toEqual({
      kind: 'step',
      pane: 'website',
    });
  });

  it.each<{ name: string; presence: RunningOrderPresence; isOver: boolean; kind: string }>([
    { name: 'no Ablauf yet → plan it', presence: 'none', isOver: false, kind: 'planRunningOrder' },
    { name: 'an Ablauf → open it', presence: 'exists', isOver: false, kind: 'openRunningOrder' },
    {
      name: 'an Ablauf after the evening → open it',
      presence: 'exists',
      isOver: true,
      kind: 'openRunningOrder',
    },
    { name: 'no Ablauf after the evening → nothing', presence: 'none', isOver: true, kind: 'none' },
    { name: 'not a planner → nothing', presence: 'hidden', isOver: false, kind: 'none' },
  ])('running order: $name', ({ presence, isOver, kind }) => {
    expect(
      paneActionOf({
        event: planned({ isOver }),
        pane: 'runningOrder',
        todayIsoDay: TODAY,
        runningOrder: presence,
        plansHall: false,
      }).kind,
    ).toBe(kind);
  });

  it.each<{
    name: string;
    overrides: Partial<PlannedEvent>;
    plansHall: boolean;
    kind: string;
  }>([
    { name: 'no plan yet → plan it', overrides: {}, plansHall: true, kind: 'planTablePlan' },
    {
      name: 'a plan → open it',
      overrides: { tablePlan: { tables: 4, chairs: 32 } },
      plansHall: true,
      kind: 'openTablePlan',
    },
    {
      name: 'a plan after the evening → open it',
      overrides: { tablePlan: { tables: 4, chairs: 32 }, isOver: true },
      plansHall: true,
      kind: 'openTablePlan',
    },
    {
      name: 'no plan after the evening → nothing',
      overrides: { isOver: true },
      plansHall: true,
      kind: 'none',
    },
    {
      name: 'no plan needed → nothing',
      overrides: { withoutTablePlan: true },
      plansHall: true,
      kind: 'none',
    },
    { name: 'not a hall planner → nothing', overrides: {}, plansHall: false, kind: 'none' },
  ])('table plan: $name', ({ overrides, plansHall, kind }) => {
    expect(
      paneActionOf({
        event: planned(overrides),
        pane: 'hall',
        todayIsoDay: TODAY,
        runningOrder: 'hidden',
        plansHall,
      }).kind,
    ).toBe(kind);
  });
});
