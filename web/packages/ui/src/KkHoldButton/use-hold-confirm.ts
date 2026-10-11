import { useState } from 'react';

export interface KkHoldConfirmState {
  open: boolean;
  ask: () => void;
  close: () => void;
  confirm: () => void;
}

export const useHoldConfirm = (onCommit: () => void): KkHoldConfirmState => {
  const [open, setOpen] = useState(false);

  return {
    open,
    ask: () => {
      setOpen(true);
    },
    close: () => {
      setOpen(false);
    },
    confirm: () => {
      setOpen(false);
      onCommit();
    },
  };
};
