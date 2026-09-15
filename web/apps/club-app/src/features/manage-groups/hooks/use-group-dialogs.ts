import { useState } from 'react';

export type GroupDialogKind = 'edit' | 'archive' | 'restore';

export interface GroupDialogs {
  open: GroupDialogKind | null;
  openEdit: () => void;
  openArchive: () => void;
  openRestore: () => void;
  close: () => void;
}

export const useGroupDialogs = (): GroupDialogs => {
  const [open, setOpen] = useState<GroupDialogKind | null>(null);

  const close = (): void => {
    setOpen(null);
  };

  return {
    open,
    openEdit: () => {
      setOpen('edit');
    },
    openArchive: () => {
      setOpen('archive');
    },
    openRestore: () => {
      setOpen('restore');
    },
    close,
  };
};
