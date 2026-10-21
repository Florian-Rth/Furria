import { useState } from 'react';

export interface CalendarToggle {
  open: boolean;
  toggle: () => void;
}

export const useCalendarToggle = (initial: boolean): CalendarToggle => {
  const [open, setOpen] = useState(initial);

  return {
    open,
    toggle: () => {
      setOpen((previous) => !previous);
    },
  };
};
