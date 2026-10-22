import type { KkSheetAction } from '@furria/ui/sheet-actions';
import { toDayRuns } from '../week-strip';
import type { CalendarLineRow } from './use-calendar-lines';
import { useCalendarSheet } from './use-calendar-sheet';
import type { StartBoard } from './use-start-view';

export interface SheetRow extends CalendarLineRow {
  dayHead: boolean;
}

export interface SheetDay {
  isoDay: string;
  focused: boolean;
  rows: SheetRow[];
}

export interface CalendarSheetDaysView {
  days: SheetDay[];
  toggle: (calendarEntryId: number) => void;
  collapse: (calendarEntryId: number) => void;
  action: KkSheetAction | undefined;
}

export const useCalendarSheetDays = (
  board: StartBoard,
  focusedDay: string | null,
): CalendarSheetDaysView => {
  const { rows, toggle, collapse, action } = useCalendarSheet(board);

  return {
    days: toDayRuns(rows, board.start.today).map((run) => ({
      isoDay: run.isoDay,
      focused: run.isoDay === focusedDay,
      rows: run.rows.map((row, index) => ({ ...row, dayHead: index === 0 })),
    })),
    toggle,
    collapse,
    action,
  };
};
