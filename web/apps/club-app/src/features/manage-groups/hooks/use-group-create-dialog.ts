import { useState } from 'react';

export interface GroupCreateDialog {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useGroupCreateDialog = (): GroupCreateDialog => {
  const [isOpen, setOpen] = useState(false);

  return {
    isOpen,
    open: () => {
      setOpen(true);
    },
    close: () => {
      setOpen(false);
    },
  };
};
