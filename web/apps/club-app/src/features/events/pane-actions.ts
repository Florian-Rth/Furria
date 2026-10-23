import { nextPaneOf } from './event-board';
import type { PlannedEvent, PublishState } from './event-plan';
import {
  factDetailsOf,
  isCancelledEvent,
  publishStateOf,
  stepStatusOf,
  ticketFactsOf,
} from './event-plan';
import type { EventPaneKey } from './schemas';

export type RunningOrderPresence = 'hidden' | 'none' | 'exists';

export type PaneAction =
  | { kind: 'publish' }
  | { kind: 'view' }
  | { kind: 'picture' }
  | { kind: 'editDetails' }
  | { kind: 'editTickets' }
  | { kind: 'album' }
  | { kind: 'planRunningOrder' }
  | { kind: 'openRunningOrder' }
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

export interface PaneActionInput {
  event: PlannedEvent;
  pane: EventPaneKey;
  todayIsoDay: string;
  addsAlbums: boolean;
  runningOrder: RunningOrderPresence;
}

export const paneActionOf = ({
  event,
  pane,
  todayIsoDay,
  addsAlbums,
  runningOrder,
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
    case 'requests':
      return event.ticketRequests.open > 0 ? NONE : next();
    case 'runningOrder':
      return runningOrderActionOf(runningOrder, event.isOver);
    case 'review': {
      const state = stepStatusOf(event, 'review')?.state;

      return addsAlbums && (state === 'open' || state === 'overdue') ? { kind: 'album' } : next();
    }
  }
};
