import { useState } from 'react';

export interface PressConfirm {
  open: boolean;
  ask: () => void;
  close: () => void;
  confirm: () => void;
}

export const usePressConfirm = (onPress: () => void): PressConfirm => {
  const [open, setOpen] = useState(false);

  const ask = (): void => {
    setOpen(true);
  };

  const close = (): void => {
    setOpen(false);
  };

  const confirm = (): void => {
    setOpen(false);
    onPress();
  };

  return { open, ask, close, confirm };
};
