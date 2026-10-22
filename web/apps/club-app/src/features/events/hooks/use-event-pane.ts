import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkStepState } from '@furria/ui/step-state';
import { GALLERY_SORT_KEYS } from '@/features/session/app-sections';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { useEventQuery } from '../api';
import type { BoardCell } from '../event-board';
import { cellOf, paneCellsOf } from '../event-board';
import { PANE_ICONS, PANE_TITLES, toCellStateLabel } from '../event-board-copy';
import { toPaneDueLabel, toPaneEyebrow } from '../event-pane-copy';
import type { PaneAction } from '../pane-actions';
import { paneActionOf } from '../pane-actions';
import type { EventDetails, EventPaneKey } from '../schemas';
import type { EventPublishing } from './use-event-publishing';
import { useEventPublishing } from './use-event-publishing';
import { usePlanClock } from './use-plan-clock';

const PUBLISHING_PANES: ReadonlySet<EventPaneKey> = new Set(['website', 'details']);

export interface EventPaneHead {
  icon: KkIconName;
  title: string;
  context: string;
  state: KkStepState;
  stateLabel: string;
  due: string;
}

export interface EventPaneState {
  event: EventDetails | undefined;
  head: EventPaneHead | null;
  tabs: BoardCell[];
  action: PaneAction;
  publishing: EventPublishing;
}

export const useEventPane = (eventId: number, pane: EventPaneKey): EventPaneState => {
  const query = useEventQuery(eventId);
  const permissions = usePermissions();
  const { today } = usePlanClock();
  const event = query.data;
  const publishing = useEventPublishing(PUBLISHING_PANES.has(pane) ? event : undefined);

  if (event === undefined) {
    return { event, head: null, tabs: [], action: { kind: 'none' }, publishing };
  }

  const cell = cellOf(event, pane, today);

  return {
    event,
    publishing,
    tabs: paneCellsOf(event, today),
    action: paneActionOf({
      event,
      pane,
      todayIsoDay: today,
      addsAlbums: GALLERY_SORT_KEYS.some(permissions.has),
    }),
    head: {
      icon: PANE_ICONS[pane],
      title: PANE_TITLES[pane],
      context: toPaneEyebrow(event),
      state: cell.state,
      stateLabel: toCellStateLabel(cell),
      due: toPaneDueLabel(event, pane, cell, today),
    },
  };
};
