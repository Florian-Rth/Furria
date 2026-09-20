import { useState } from 'react';

export interface BoardCreateDialog {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useBoardCreateDialog = (): BoardCreateDialog => {
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
