import { useKkSheet } from '@furria/ui';
import { useState } from 'react';
import { owedEntriesOf } from '../calendar-tile';
import type { StartEntry } from '../schemas';
import { byStartsAt } from '../start-board';
import { entriesOf, START_OWED_SHEET } from '../start-sheets';
import type { StartBoard } from './use-start-view';

export interface OwedSheetView {
  sheetId: string;
  entries: StartEntry[];
}

const NOTHING_HELD: readonly number[] = [];

const idsOf = (entries: readonly StartEntry[]): number[] =>
  entries.map((entry) => entry.calendarEntryId);

export const useOwedSheet = (board: StartBoard): OwedSheetView => {
  const { openSheetId } = useKkSheet();
  const open = openSheetId === START_OWED_SHEET;
  const entries = byStartsAt(entriesOf(board.start));
  const [held, setHeld] = useState<{ open: boolean; ids: readonly number[] }>({
    open: false,
    ids: NOTHING_HELD,
  });

  if (held.open !== open) {
    setHeld({ open, ids: open ? idsOf(owedEntriesOf(entries)) : held.ids });
  }

  return {
    sheetId: START_OWED_SHEET,
    entries: entries.filter((entry) => held.ids.includes(entry.calendarEntryId)),
  };
};
