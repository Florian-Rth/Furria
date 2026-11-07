import { useState } from 'react';

export interface Drawer {
  shown: boolean;
  open: () => void;
  close: () => void;
}

export const useDrawer = (): Drawer => {
  const [shown, setShown] = useState(false);

  return {
    shown,
    open: () => {
      setShown(true);
    },
    close: () => {
      setShown(false);
    },
  };
};
