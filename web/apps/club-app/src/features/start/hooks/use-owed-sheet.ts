import { useKkSheet } from '@furria/ui/sheet-store';
import { useState } from 'react';
import type { OwedGroup } from '../owed-items';
import { toAnswerItems, toOwedGroups, toOwedKeys } from '../owed-items';
import { byStartsAt } from '../start-board';
import { announcementAddOnsOf, entriesOf, START_OWED_SHEET } from '../start-sheets';
import type { StartBoard } from './use-start-view';

export interface OwedSheetView {
  sheetId: string;
  groups: OwedGroup[];
}

const NOTHING_HELD: readonly string[] = [];

export const useOwedSheet = (board: StartBoard): OwedSheetView => {
  const { openSheetId } = useKkSheet();
  const open = openSheetId === START_OWED_SHEET;
  const sources = {
    entries: byStartsAt(entriesOf(board.start)),
    announcements: announcementAddOnsOf(board.start),
  };
  const [held, setHeld] = useState<{ open: boolean; keys: readonly string[] }>({
    open: false,
    keys: NOTHING_HELD,
  });

  if (held.open !== open) {
    setHeld({ open, keys: open ? toOwedKeys(sources) : held.keys });
  }

  return {
    sheetId: START_OWED_SHEET,
    groups: toOwedGroups(toAnswerItems(sources).filter((item) => held.keys.includes(item.key))),
  };
};
