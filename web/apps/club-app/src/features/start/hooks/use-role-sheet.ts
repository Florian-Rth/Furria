import type { KkSheetAction } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import { MANAGE_PATH } from '@/features/session';
import { toPeekId } from '@/lib/peek';
import { usePeek } from '@/lib/use-peek';
import type { RoleSheetVariant, RoleSheetView } from '../role-sheet';
import { ROLE_SHEET_KINDS, toRoleSheet } from '../role-sheet';
import type { StartMine } from '../schemas';
import { mineOf } from '../start-sheets';
import type { StartBoard } from './use-start-view';

export interface RoleSheetState extends RoleSheetView {
  sheetId: string;
  action: KkSheetAction | undefined;
}

const MANAGE_LABEL = 'Verein verwalten';
const NO_SUBJECT = 0;

const subjectOf = (mine: StartMine): number => mine.subjectId ?? NO_SUBJECT;

export const useRoleSheet = (
  variant: RoleSheetVariant,
  board: StartBoard,
): RoleSheetState | null => {
  const kind = ROLE_SHEET_KINDS[variant];
  const mine = usePeek(
    variant,
    mineOf(board.start).filter((item) => item.kind === kind),
    subjectOf,
  );

  if (mine === null) {
    return null;
  }

  const view = toRoleSheet(mine);

  return {
    ...view,
    sheetId: toPeekId(variant, subjectOf(mine)),
    action: view.manages ? { label: MANAGE_LABEL, component: Link, to: MANAGE_PATH } : undefined,
  };
};
