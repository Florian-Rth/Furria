import { useState } from 'react';

export type KkMomentDrawer = 'day' | 'time';

export interface KkMomentDrawerControl {
  open: KkMomentDrawer | null;
  openDay: () => void;
  openTime: () => void;
  close: () => void;
}

export const useMomentDrawer = (): KkMomentDrawerControl => {
  const [open, setOpen] = useState<KkMomentDrawer | null>(null);

  return {
    open,
    openDay: () => {
      setOpen('day');
    },
    openTime: () => {
      setOpen('time');
    },
    close: () => {
      setOpen(null);
    },
  };
};
