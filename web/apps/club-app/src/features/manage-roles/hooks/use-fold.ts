import { useState } from 'react';

export interface FoldControl {
  open: boolean;
  toggle: () => void;
}

export const useFold = (): FoldControl => {
  const [open, setOpen] = useState(false);

  return {
    open,
    toggle: () => {
      setOpen((current) => !current);
    },
  };
};
