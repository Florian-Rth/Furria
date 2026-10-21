import type { CalendarRow } from '../start-board';
import { useAnswerExpansion } from './use-answer-expansion';

export interface CalendarLineRow extends CalendarRow {
  expanded: boolean;
}

export interface CalendarLinesView {
  rows: CalendarLineRow[];
  toggle: (calendarEntryId: number) => void;
  collapse: (calendarEntryId: number) => void;
}

export const useCalendarLines = (rows: readonly CalendarRow[]): CalendarLinesView => {
  const { expandedId, toggle, collapse } = useAnswerExpansion();

  return {
    rows: rows.map((row) => ({ ...row, expanded: row.entry.calendarEntryId === expandedId })),
    toggle,
    collapse,
  };
};
