import type { KkSheetAction } from '@furria/ui/sheet-actions';
import { Link } from '@tanstack/react-router';
import { toPeekId } from '@/lib/peek';
import { usePeek } from '@/lib/use-peek';
import type { OfficeSheetView } from '../office-sheet';
import { toOfficeSheet } from '../office-sheet';
import type { StartMine } from '../schemas';
import { mineOf } from '../start-sheets';
import type { StartBoard } from './use-start-view';

export interface OfficeSheetState extends OfficeSheetView {
  sheetId: string;
  action: KkSheetAction | undefined;
}

const NO_SUBJECT = 0;

const subjectOf = (mine: StartMine): number => mine.subjectId ?? NO_SUBJECT;

export const useOfficeSheet = (board: StartBoard): OfficeSheetState | null => {
  const mine = usePeek(
    'office',
    mineOf(board.start).filter((item) => item.kind === 'newBoardSeat'),
    subjectOf,
  );

  if (mine === null) {
    return null;
  }

  const view = toOfficeSheet(mine);

  return {
    ...view,
    sheetId: toPeekId('office', subjectOf(mine)),
    action:
      view.workbench === null
        ? undefined
        : { label: view.workbench.label, component: Link, to: view.workbench.to },
  };
};
