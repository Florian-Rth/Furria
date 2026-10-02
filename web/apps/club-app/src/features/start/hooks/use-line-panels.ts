import type { StartGroupMoment, StartMine } from '../schemas';
import type { StartPanelOf } from '../start-board';
import { hiddenCountOf, shownItemsOf } from '../start-board';
import type { StartLineView } from '../start-lines';
import { toGroupMomentLine, toMineLine } from '../start-lines';
import { START_GROUPS_SHEET, START_MINE_SHEET } from '../start-sheets';
import type { PanelFoot } from './use-panel-foot';
import { usePanelFoot } from './use-panel-foot';
import type { StartBoard } from './use-start-view';

export interface StartLineRow {
  line: StartLineView;
  dimmed: boolean;
}

export interface LinesPanelView {
  rows: StartLineRow[];
  foot: PanelFoot | null;
}

const rowsOf = (lines: readonly StartLineView[], board: StartBoard): StartLineRow[] =>
  lines.map((line) => ({ line, dimmed: board.dimmedKeys.has(line.key) }));

export const toMineRows = (mine: readonly StartMine[], board: StartBoard): StartLineRow[] =>
  rowsOf(
    mine.map((item) =>
      toMineLine(item, {
        today: board.start.today,
        canReadClub: board.canReadClub,
        memberSince: board.memberSince,
      }),
    ),
    board,
  );

export const toGroupRows = (
  moments: readonly StartGroupMoment[],
  board: StartBoard,
): StartLineRow[] => rowsOf(moments.map(toGroupMomentLine), board);

export const useMinePanel = (panel: StartPanelOf<'mine'>, board: StartBoard): LinesPanelView => {
  const foot = usePanelFoot(START_MINE_SHEET, hiddenCountOf(panel));

  return { rows: toMineRows(shownItemsOf(panel.mine, panel.shownCount), board), foot };
};

export const useGroupsPanel = (
  panel: StartPanelOf<'groups'>,
  board: StartBoard,
): LinesPanelView => {
  const foot = usePanelFoot(START_GROUPS_SHEET, hiddenCountOf(panel));

  return {
    rows: toGroupRows(shownItemsOf(panel.groupMoments, panel.shownCount), board),
    foot,
  };
};
