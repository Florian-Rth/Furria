import type { StartBoard } from './hooks/use-start-view';
import type { StartGroupMoment, StartMine } from './schemas';
import type { StartLineView } from './start-lines';
import { toGroupMomentLine, toMineLine } from './start-lines';

export interface StartLineRow {
  line: StartLineView;
  dimmed: boolean;
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
