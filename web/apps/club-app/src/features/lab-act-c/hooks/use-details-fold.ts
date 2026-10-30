import { useState } from 'react';

const DETAILS_KEY = 'furria.lab-act-c.details';
const OPEN = 'open';

const readOpen = (): boolean => {
  try {
    return window.localStorage.getItem(DETAILS_KEY) === OPEN;
  } catch {
    return false;
  }
};

const writeOpen = (open: boolean): void => {
  try {
    if (open) {
      window.localStorage.setItem(DETAILS_KEY, OPEN);
    } else {
      window.localStorage.removeItem(DETAILS_KEY);
    }
  } catch {
    return;
  }
};

export interface DetailsFold {
  open: boolean;
  toggle: () => void;
}

export const useDetailsFold = (): DetailsFold => {
  const [open, setOpen] = useState(readOpen);

  const toggle = (): void => {
    writeOpen(!open);
    setOpen(!open);
  };

  return { open, toggle };
};
