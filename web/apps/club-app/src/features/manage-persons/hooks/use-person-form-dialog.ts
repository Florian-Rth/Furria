import { useState } from 'react';

export interface PersonFormDialogControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const usePersonFormDialog = (): PersonFormDialogControl => {
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
