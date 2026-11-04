import { nextPaneOf } from './event-board';
import type { PlannedEvent, PublishState } from './event-plan';
import { factDetailsOf, isCancelledEvent, publishStateOf, ticketFactsOf } from './event-plan';
import type { EventPaneKey } from './schemas';

export type RunningOrderPresence = 'hidden' | 'none' | 'exists';

export type PaneAction =
  | { kind: 'publish' }
  | { kind: 'view' }
  | { kind: 'picture' }
  | { kind: 'editDetails' }
  | { kind: 'editTickets' }
  | { kind: 'planRunningOrder' }
  | { kind: 'openRunningOrder' }
  | { kind: 'planTablePlan' }
  | { kind: 'openTablePlan' }
  | { kind: 'step'; pane: EventPaneKey }
  | { kind: 'none' };

const NONE: PaneAction = { kind: 'none' };

const stepOrNone = (pane: EventPaneKey | null): PaneAction =>
  pane === null ? NONE : { kind: 'step', pane };

const WEBSITE_ACTIONS: Record<PublishState, PaneAction> = {
  published: { kind: 'view' },
  ready: { kind: 'publish' },
  blocked: { kind: 'step', pane: 'details' },
  closed: NONE,
};

const runningOrderActionOf = (presence: RunningOrderPresence, isOver: boolean): PaneAction => {
  switch (presence) {
    case 'hidden':
      return NONE;
    case 'exists':
      return { kind: 'openRunningOrder' };
    case 'none':
      return isOver ? NONE : { kind: 'planRunningOrder' };
  }
};

const tablePlanActionOf = (event: PlannedEvent, plansHall: boolean): PaneAction => {
  if (!plansHall) {
    return NONE;
  }
  if (event.tablePlan !== null) {
    return { kind: 'openTablePlan' };
  }

  return event.isOver || event.withoutTablePlan ? NONE : { kind: 'planTablePlan' };
};

export interface PaneActionInput {
  event: PlannedEvent;
  pane: EventPaneKey;
  todayIsoDay: string;
  runningOrder: RunningOrderPresence;
  plansHall: boolean;
}

export const paneActionOf = ({
  event,
  pane,
  todayIsoDay,
  runningOrder,
  plansHall,
}: PaneActionInput): PaneAction => {
  if (isCancelledEvent(event)) {
    return NONE;
  }

  const next = (): PaneAction => stepOrNone(nextPaneOf(event, pane, todayIsoDay));
  const publishState = publishStateOf(event);

  switch (pane) {
    case 'website':
      return WEBSITE_ACTIONS[publishState];
    case 'details': {
      const missing = factDetailsOf(event.detailsMissing);

      if (missing.includes('picture')) {
        return { kind: 'picture' };
      }
      if (missing.length > 0) {
        return { kind: 'editDetails' };
      }

      return publishState === 'ready' ? { kind: 'publish' } : next();
    }
    case 'tickets':
      return ticketFactsOf(event).length > 0 && event.status !== 'soldOut'
        ? { kind: 'editTickets' }
        : next();
    case 'runningOrder':
      return runningOrderActionOf(runningOrder, event.isOver);
    case 'hall':
      return tablePlanActionOf(event, plansHall);
  }
};
