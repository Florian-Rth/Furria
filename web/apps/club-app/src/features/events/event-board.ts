import type { KkStepState } from '@furria/ui/step-state';
import { toIsoDay } from '@/lib/day';
import type { FactDetail, PlannedEvent, TicketFact } from './event-plan';
import {
  boardStateOf,
  daysBetween,
  daysUntilEvent,
  factDetailsOf,
  isCancelledEvent,
  isInPreparation,
  leadShareOf,
  publishStateOf,
  stepStatusOf,
  ticketFactsOf,
} from './event-plan';
import type {
  BoardFilter,
  EventPaneKey,
  EventSalesStatus,
  EventStepKey,
  EventStepState,
} from './schemas';
import { EVENT_PANE_KEYS } from './schemas';

export const BOARD_COLUMNS = [...EVENT_PANE_KEYS, 'deadline'] as const;
export type BoardColumn = (typeof BOARD_COLUMNS)[number];

export const DUE_SOON_DAYS = 14;

export type CellFact =
  | { kind: 'online'; sinceDay: string }
  | { kind: 'publishReady' }
  | { kind: 'blocked'; missing: number }
  | { kind: 'neverPublished' }
  | { kind: 'factsMissing'; details: FactDetail[] }
  | { kind: 'factsComplete' }
  | { kind: 'ticketFactsMissing'; facts: TicketFact[] }
  | {
      kind: 'sales';
      status: EventSalesStatus;
      priceCents: number | null;
      presaleStartsAt: string | null;
    }
  | { kind: 'review'; albums: number; news: number }
  | { kind: 'reviewOpens'; opensOn: string }
  | { kind: 'runningOrder'; stands: boolean }
  | { kind: 'runningOrderOpens'; opensOn: string }
  | { kind: 'deadline'; step: EventStepKey; dueOn: string; daysLeft: number }
  | { kind: 'allDone' }
  | { kind: 'cancelled' };

export interface BoardCell {
  column: BoardColumn;
  pane: EventPaneKey;
  state: KkStepState;
  fact: CellFact;
}

const STEP_PANES: Record<EventStepKey, EventPaneKey> = {
  details: 'details',
  tickets: 'tickets',
  runningOrder: 'runningOrder',
  review: 'review',
};

const stepStateOf = (event: PlannedEvent, step: EventStepKey): KkStepState => {
  const status = stepStatusOf(event, step);

  return status === null ? 'off' : boardStateOf(status.state, step, event.currentStep);
};

const websiteCellOf = (event: PlannedEvent): BoardCell => {
  const base = { column: 'website', pane: 'website' } as const;

  switch (publishStateOf(event)) {
    case 'published':
      return {
        ...base,
        state: 'done',
        fact: {
          kind: 'online',
          sinceDay: toIsoDay(new Date(event.publishedAt ?? event.createdAt)),
        },
      };
    case 'ready':
      return { ...base, state: 'current', fact: { kind: 'publishReady' } };
    case 'closed':
      return { ...base, state: 'off', fact: { kind: 'neverPublished' } };
    case 'blocked':
      return {
        ...base,
        state: stepStatusOf(event, 'details')?.state === 'overdue' ? 'overdue' : 'open',
        fact: { kind: 'blocked', missing: factDetailsOf(event.detailsMissing).length },
      };
  }
};

const detailsCellOf = (event: PlannedEvent): BoardCell => {
  const details = factDetailsOf(event.detailsMissing);

  return {
    column: 'details',
    pane: 'details',
    state: stepStateOf(event, 'details'),
    fact: details.length > 0 ? { kind: 'factsMissing', details } : { kind: 'factsComplete' },
  };
};

const ticketsCellOf = (event: PlannedEvent): BoardCell => {
  const facts = ticketFactsOf(event);

  return {
    column: 'tickets',
    pane: 'tickets',
    state: stepStateOf(event, 'tickets'),
    fact:
      facts.length > 0 && event.status !== 'soldOut'
        ? { kind: 'ticketFactsMissing', facts }
        : {
            kind: 'sales',
            status: event.status,
            priceCents: event.priceCents,
            presaleStartsAt: event.presaleStartsAt,
          },
  };
};

const reviewCellOf = (event: PlannedEvent): BoardCell => {
  const status = stepStatusOf(event, 'review');
  const opens = status?.state === 'waiting' && status.opensOn !== null ? status.opensOn : null;

  return {
    column: 'review',
    pane: 'review',
    state: stepStateOf(event, 'review'),
    fact:
      opens !== null && event.review.publishedAlbums === 0 && event.review.publishedNews === 0
        ? { kind: 'reviewOpens', opensOn: opens }
        : {
            kind: 'review',
            albums: event.review.publishedAlbums,
            news: event.review.publishedNews,
          },
  };
};

const runningOrderCellOf = (event: PlannedEvent): BoardCell => {
  const status = stepStatusOf(event, 'runningOrder');
  const opens = status?.state === 'waiting' && status.opensOn !== null ? status.opensOn : null;

  return {
    column: 'runningOrder',
    pane: 'runningOrder',
    state: stepStateOf(event, 'runningOrder'),
    fact:
      opens === null
        ? { kind: 'runningOrder', stands: status?.state === 'done' }
        : { kind: 'runningOrderOpens', opensOn: opens },
  };
};

const STATE_RANK: Record<EventStepState, number> = { overdue: 0, open: 1, waiting: 2, done: 3 };

export const nextDeadlineOf = (
  event: PlannedEvent,
): { step: EventStepKey; state: EventStepState; dueOn: string } | null => {
  const pending = event.steps
    .filter((status) => status.state !== 'done')
    .sort(
      (left, right) =>
        STATE_RANK[left.state] - STATE_RANK[right.state] || left.dueOn.localeCompare(right.dueOn),
    );
  const first = pending[0];

  return first === undefined ? null : { step: first.step, state: first.state, dueOn: first.dueOn };
};

const deadlineCellOf = (event: PlannedEvent, todayIsoDay: string): BoardCell => {
  const next = nextDeadlineOf(event);

  if (next === null) {
    return { column: 'deadline', pane: 'review', state: 'done', fact: { kind: 'allDone' } };
  }

  return {
    column: 'deadline',
    pane: STEP_PANES[next.step],
    state: next.state === 'overdue' ? 'overdue' : next.state === 'waiting' ? 'waiting' : 'open',
    fact: {
      kind: 'deadline',
      step: next.step,
      dueOn: next.dueOn,
      daysLeft: daysBetween(todayIsoDay, next.dueOn),
    },
  };
};

const cancelledCellOf = (column: BoardColumn): BoardCell => ({
  column,
  pane: column === 'deadline' ? 'details' : column,
  state: 'off',
  fact: { kind: 'cancelled' },
});

export const cellOf = (
  event: PlannedEvent,
  column: BoardColumn,
  todayIsoDay: string,
): BoardCell => {
  if (isCancelledEvent(event)) {
    return cancelledCellOf(column);
  }

  switch (column) {
    case 'website':
      return websiteCellOf(event);
    case 'details':
      return detailsCellOf(event);
    case 'tickets':
      return ticketsCellOf(event);
    case 'runningOrder':
      return runningOrderCellOf(event);
    case 'review':
      return reviewCellOf(event);
    case 'deadline':
      return deadlineCellOf(event, todayIsoDay);
  }
};

export const paneCellsOf = (event: PlannedEvent, todayIsoDay: string): BoardCell[] =>
  EVENT_PANE_KEYS.map((pane) => cellOf(event, pane, todayIsoDay));

export const isDueSoon = (dueOn: string, todayIsoDay: string): boolean => {
  const days = daysBetween(todayIsoDay, dueOn);

  return days >= 0 && days <= DUE_SOON_DAYS;
};

export const pressingDayOf = (event: PlannedEvent, todayIsoDay: string): string => {
  const days = event.steps
    .filter((status) => status.state === 'overdue' || status.state === 'open')
    .map((status) => status.dueOn);

  if (publishStateOf(event) === 'ready') {
    days.push(todayIsoDay);
  }

  return days.sort()[0] ?? event.startsAt.slice(0, 10);
};

const byStart = <TEvent extends PlannedEvent>(left: TEvent, right: TEvent): number =>
  left.startsAt.localeCompare(right.startsAt);

const byPressingDay =
  (todayIsoDay: string) =>
  <TEvent extends PlannedEvent>(left: TEvent, right: TEvent): number =>
    pressingDayOf(left, todayIsoDay).localeCompare(pressingDayOf(right, todayIsoDay)) ||
    byStart(left, right);

export const isOverdueEvent = (event: PlannedEvent): boolean =>
  !isCancelledEvent(event) && event.steps.some((status) => status.state === 'overdue');

export const isDueSoonEvent = (event: PlannedEvent, todayIsoDay: string): boolean =>
  !isCancelledEvent(event) &&
  event.steps.some(
    (status) =>
      (status.state === 'open' || status.state === 'waiting') &&
      isDueSoon(status.dueOn, todayIsoDay),
  );

export const filterEvents = <TEvent extends PlannedEvent>(
  events: readonly TEvent[],
  filter: BoardFilter,
  todayIsoDay: string,
): TEvent[] => {
  const coming = events.filter((event) => !event.isOver).sort(byStart);
  const past = events
    .filter((event) => event.isOver)
    .sort(byStart)
    .reverse();

  switch (filter) {
    case 'all':
      return [...coming, ...past];
    case 'overdue':
      return events.filter(isOverdueEvent).sort(byPressingDay(todayIsoDay));
    case 'dueSoon':
      return events
        .filter((event) => isDueSoonEvent(event, todayIsoDay))
        .sort(byPressingDay(todayIsoDay));
    case 'offline':
      return coming.filter(isInPreparation);
    case 'past':
      return past;
  }
};

export const filterCountsOf = (
  events: readonly PlannedEvent[],
  todayIsoDay: string,
): Record<BoardFilter, number> => ({
  all: events.length,
  overdue: filterEvents(events, 'overdue', todayIsoDay).length,
  dueSoon: filterEvents(events, 'dueSoon', todayIsoDay).length,
  offline: filterEvents(events, 'offline', todayIsoDay).length,
  past: filterEvents(events, 'past', todayIsoDay).length,
});

export type CountedState = Exclude<KkStepState, 'off'>;

export const COUNTED_STATES: readonly CountedState[] = [
  'done',
  'overdue',
  'current',
  'open',
  'waiting',
];

export interface StateTally {
  counts: Record<CountedState, number>;
  total: number;
}

const tallyCells = (cells: readonly BoardCell[]): StateTally => {
  const counts: Record<CountedState, number> = {
    done: 0,
    overdue: 0,
    current: 0,
    open: 0,
    waiting: 0,
  };

  for (const cell of cells) {
    if (cell.state !== 'off') {
      counts[cell.state] += 1;
    }
  }

  return { counts, total: COUNTED_STATES.reduce((sum, state) => sum + counts[state], 0) };
};

export const eventTallyOf = (event: PlannedEvent, todayIsoDay: string): StateTally =>
  tallyCells(paneCellsOf(event, todayIsoDay));

export const sessionTallyOf = (events: readonly PlannedEvent[], todayIsoDay: string): StateTally =>
  tallyCells(
    events
      .filter((event) => !event.isOver && !isCancelledEvent(event))
      .flatMap((event) => paneCellsOf(event, todayIsoDay)),
  );

const PENDING_STATES: readonly KkStepState[] = ['overdue', 'current', 'open'];

export const nextPaneOf = (
  event: PlannedEvent,
  pane: EventPaneKey,
  todayIsoDay: string,
): EventPaneKey | null => {
  const start = EVENT_PANE_KEYS.indexOf(pane);
  const ordered = [...EVENT_PANE_KEYS.slice(start + 1), ...EVENT_PANE_KEYS.slice(0, start)];
  const pending = ordered
    .map((candidate) => cellOf(event, candidate, todayIsoDay))
    .filter((cell) => PENDING_STATES.includes(cell.state));

  return pending[0]?.pane ?? null;
};

export const leadRemainingOf = (
  event: Pick<PlannedEvent, 'createdAt' | 'startsAt' | 'isOver' | 'status'>,
  now: Date,
): number | null => (event.isOver || isCancelledEvent(event) ? null : 1 - leadShareOf(event, now));

export const defaultPaneOf = (event: PlannedEvent): EventPaneKey => {
  if (isCancelledEvent(event)) {
    return 'details';
  }

  if (publishStateOf(event) === 'ready') {
    return 'website';
  }

  return event.currentStep === null ? 'website' : STEP_PANES[event.currentStep];
};

export const daysLeftOf = (event: PlannedEvent, todayIsoDay: string): number =>
  daysUntilEvent(event.startsAt, todayIsoDay);
