import { useState } from 'react';

export type GroupDialogKind = 'edit' | 'archive' | 'restore';

export interface GroupDialogs {
  open: GroupDialogKind | null;
  groupId: number | null;
  openEdit: (groupId: number) => void;
  openArchive: (groupId: number) => void;
  openRestore: (groupId: number) => void;
  close: () => void;
}

export const useGroupDialogs = (): GroupDialogs => {
  const [open, setOpen] = useState<GroupDialogKind | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);

  const openFor =
    (kind: GroupDialogKind) =>
    (selected: number): void => {
      setGroupId(selected);
      setOpen(kind);
    };

  const close = (): void => {
    setOpen(null);
    setGroupId(null);
  };

  return {
    open,
    groupId,
    openEdit: openFor('edit'),
    openArchive: openFor('archive'),
    openRestore: openFor('restore'),
    close,
  };
};
