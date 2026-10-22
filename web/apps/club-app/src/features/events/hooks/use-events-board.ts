import { useIsMobile } from '@furria/ui/use-is-mobile';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEventsQuery } from '../api';
import type { BoardCell } from '../event-board';
import {
  cellOf,
  daysLeftOf,
  filterCountsOf,
  filterEvents,
  leadRemainingOf,
  paneCellsOf,
  sessionTallyOf,
} from '../event-board';
import type { DueView, FilterView, TallyView } from '../event-board-copy';
import { toDueView, toFilterViews, toTallyView } from '../event-board-copy';
import type { BoardFilter, EventSummary, EventsResponse } from '../schemas';
import type { PaneSelectionControl } from './use-pane-selection';
import { usePaneSelection } from './use-pane-selection';
import { usePlanClock } from './use-plan-clock';

const EVENTS_ROUTE_ID = '/_app/events';
const EVENTS_PATH = '/events';

export interface BoardRow {
  event: EventSummary;
  cells: BoardCell[];
  due: DueView | null;
  daysLeft: number;
  remaining: number | null;
}

export interface EventsBoardState {
  query: UseQueryResult<EventsResponse, Error>;
  isTable: boolean;
  tally: TallyView;
  filter: BoardFilter;
  filters: FilterView[];
  chooseFilter: (filter: BoardFilter) => void;
  rows: BoardRow[];
  selection: PaneSelectionControl;
  reload: () => void;
}

export const useEventsBoard = (): EventsBoardState => {
  const query = useEventsQuery();
  const { now, today } = usePlanClock();
  const isMobile = useIsMobile();
  const selection = usePaneSelection();
  const navigate = useNavigate();
  const { filter = 'all' } = useSearch({ from: EVENTS_ROUTE_ID });
  const events = query.data?.events ?? [];

  return {
    query,
    isTable: !isMobile,
    tally: toTallyView(sessionTallyOf(events, today)),
    filter,
    filters: toFilterViews(filterCountsOf(events, today)),
    chooseFilter: (next) => {
      const chosen = next === filter || next === 'all' ? undefined : next;

      void navigate({
        to: EVENTS_PATH,
        search: (previous) => ({ ...previous, filter: chosen }),
        replace: true,
        resetScroll: false,
      });
    },
    rows: filterEvents(events, filter, today).map((event) => ({
      event,
      cells: paneCellsOf(event, today),
      due: toDueView(cellOf(event, 'deadline', today)),
      daysLeft: daysLeftOf(event, today),
      remaining: leadRemainingOf(event, now),
    })),
    selection,
    reload: () => {
      void query.refetch();
    },
  };
};
