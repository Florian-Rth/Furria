import type { UseQueryResult } from '@tanstack/react-query';
import { parsePositiveId } from '@/lib/positive-id';
import { useEventQuery } from '../api';
import type { BoardCell } from '../event-board';
import { defaultPaneOf, eventTallyOf, paneCellsOf } from '../event-board';
import type { EventHeadView } from '../event-pane-copy';
import { toEventHeadView } from '../event-pane-copy';
import type { EventDetails, EventPaneKey } from '../schemas';
import type { EventStepControl } from './use-event-step';
import { useEventStep } from './use-event-step';
import { usePlanClock } from './use-plan-clock';

export interface EventPageState {
  eventId: number | null;
  query: UseQueryResult<EventDetails, Error>;
  today: string;
  cells: BoardCell[];
  head: EventHeadView | null;
  pane: EventPaneKey | null;
  step: EventStepControl;
}

export const useEventPage = (rawEventId: string): EventPageState => {
  const eventId = parsePositiveId(rawEventId);
  const query = useEventQuery(eventId);
  const { today } = usePlanClock();
  const step = useEventStep();
  const event = query.data;
  const fallback = event === undefined || !step.isWide ? null : defaultPaneOf(event, today);

  return {
    eventId,
    query,
    today,
    cells: event === undefined ? [] : paneCellsOf(event, today),
    head: event === undefined ? null : toEventHeadView(event, eventTallyOf(event, today)),
    pane: step.step ?? fallback,
    step,
  };
};
