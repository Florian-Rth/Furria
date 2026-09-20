import { useState } from 'react';
import type { GroupKindEntry } from '../manage-groups-labels';

export type GroupKindDialog = 'create' | 'rename' | 'archive' | 'restore';

export interface GroupKindDialogs {
  openDialog: GroupKindDialog | null;
  kind: GroupKindEntry | null;
  openCreate: () => void;
  openFor: (dialog: GroupKindDialog, groupKindId: number) => void;
  close: () => void;
}

export const useGroupKindDialogs = (entries: readonly GroupKindEntry[]): GroupKindDialogs => {
  const [openDialog, setOpenDialog] = useState<GroupKindDialog | null>(null);
  const [groupKindId, setGroupKindId] = useState<number | null>(null);

  const openCreate = (): void => {
    setGroupKindId(null);
    setOpenDialog('create');
  };

  const openFor = (dialog: GroupKindDialog, selectedId: number): void => {
    setGroupKindId(selectedId);
    setOpenDialog(dialog);
  };

  const close = (): void => {
    setOpenDialog(null);
    setGroupKindId(null);
  };

  const kind = entries.find((entry) => entry.groupKindId === groupKindId) ?? null;

  return { openDialog, kind, openCreate, openFor, close };
};
