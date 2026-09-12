import { useState } from 'react';
import type { RoleHolder } from '../schemas';

export type RoleDialog = 'rename' | 'add-holder' | 'archive';

export interface RoleDialogs {
  openDialog: RoleDialog | null;
  endHolder: RoleHolder | null;
  open: (dialog: RoleDialog) => void;
  openEndHolding: (roleHoldingId: number) => void;
  close: () => void;
}

export const useRoleDialogs = (holders: readonly RoleHolder[]): RoleDialogs => {
  const [openDialog, setOpenDialog] = useState<RoleDialog | null>(null);
  const [endHoldingId, setEndHoldingId] = useState<number | null>(null);

  const open = (dialog: RoleDialog): void => {
    setEndHoldingId(null);
    setOpenDialog(dialog);
  };

  const openEndHolding = (roleHoldingId: number): void => {
    setOpenDialog(null);
    setEndHoldingId(roleHoldingId);
  };

  const close = (): void => {
    setOpenDialog(null);
    setEndHoldingId(null);
  };

  const endHolder = holders.find((holder) => holder.roleHoldingId === endHoldingId) ?? null;

  return { openDialog, endHolder, open, openEndHolding, close };
};
