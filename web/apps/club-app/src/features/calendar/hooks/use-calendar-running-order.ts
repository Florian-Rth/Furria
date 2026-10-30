import { useEveningRunningOrderQuery } from '@/features/running-order/api';
import {
  RUNNING_ORDER_CONFIRMED,
  RUNNING_ORDER_DRAFT,
  RUNNING_ORDER_EMPTY,
  RUNNING_ORDER_ERROR,
} from '../evening-running-order-copy';
import type { CalendarEntry } from '../schemas';

export interface CalendarRunningOrderRow {
  key: string;
  number: string;
  title: string;
  groupName: string | null;
  own: boolean;
}

export type CalendarRunningOrder =
  | { state: 'none' }
  | { state: 'loading' }
  | { state: 'note'; note: string }
  | { state: 'ready'; note: string; rows: CalendarRunningOrderRow[] };

export const useCalendarRunningOrder = (entry: CalendarEntry): CalendarRunningOrder => {
  const isEvening = entry.kind === 'event';
  const query = useEveningRunningOrderQuery(isEvening ? entry.calendarEntryId : null);

  if (!isEvening) {
    return { state: 'none' };
  }
  if (query.data === undefined) {
    return query.isError ? { state: 'note', note: RUNNING_ORDER_ERROR } : { state: 'loading' };
  }
  if (query.data.lines.length === 0) {
    return { state: 'note', note: RUNNING_ORDER_EMPTY };
  }

  return {
    state: 'ready',
    note: query.data.confirmed ? RUNNING_ORDER_CONFIRMED : RUNNING_ORDER_DRAFT,
    rows: query.data.lines.map((line) => ({
      key: String(line.actId),
      number: String(line.position + 1),
      title: line.name,
      groupName: line.group?.name ?? null,
      own: line.own,
    })),
  };
};
