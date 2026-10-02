import type { CalendarRow, StartPanelOf } from '../start-board';
import { hiddenCountOf, shownItemsOf, toCalendarRows } from '../start-board';
import { START_CALENDAR_SHEET } from '../start-sheets';
import { useAnswerExpansion } from './use-answer-expansion';
import type { PanelFoot } from './use-panel-foot';
import { usePanelFoot } from './use-panel-foot';

export interface CalendarLineRow extends CalendarRow {
  expanded: boolean;
}

export interface CalendarLinesView {
  rows: CalendarLineRow[];
  toggle: (calendarEntryId: number) => void;
  collapse: (calendarEntryId: number) => void;
}

export interface CalendarPanelView extends CalendarLinesView {
  foot: PanelFoot | null;
}

export const useCalendarLines = (rows: readonly CalendarRow[]): CalendarLinesView => {
  const { expandedId, toggle, collapse } = useAnswerExpansion();

  return {
    rows: rows.map((row) => ({ ...row, expanded: row.entry.calendarEntryId === expandedId })),
    toggle,
    collapse,
  };
};

export const useCalendarPanel = (
  panel: StartPanelOf<'calendar'>,
  dimmedKeys: ReadonlySet<string>,
): CalendarPanelView => {
  const lines = useCalendarLines(
    toCalendarRows(shownItemsOf(panel.entries, panel.shownCount), dimmedKeys),
  );
  const foot = usePanelFoot(START_CALENDAR_SHEET, hiddenCountOf(panel));

  return { ...lines, foot };
};
