import { groupMomentsOf, mineOf, START_GROUPS_SHEET, START_MINE_SHEET } from '../start-sheets';
import type { StartLineRow } from './use-line-panels';
import { toGroupRows, toMineRows } from './use-line-panels';
import type { StartBoard } from './use-start-view';

export type LinesSheetKind = 'mine' | 'groups';

export interface LinesSheetView {
  sheetId: string;
  title: string;
  rows: StartLineRow[];
}

const SHEET_TITLES: Record<LinesSheetKind, string> = {
  mine: 'Bei dir',
  groups: 'Deine Gruppen',
};

export const useLinesSheet = (kind: LinesSheetKind, board: StartBoard): LinesSheetView =>
  kind === 'mine'
    ? {
        sheetId: START_MINE_SHEET,
        title: SHEET_TITLES.mine,
        rows: toMineRows(mineOf(board.start), board),
      }
    : {
        sheetId: START_GROUPS_SHEET,
        title: SHEET_TITLES.groups,
        rows: toGroupRows(groupMomentsOf(board.start), board),
      };
