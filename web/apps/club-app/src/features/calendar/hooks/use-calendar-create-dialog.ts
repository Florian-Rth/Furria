import { useState } from 'react';

export interface CalendarCreateDialog {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useCalendarCreateDialog = (): CalendarCreateDialog => {
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
