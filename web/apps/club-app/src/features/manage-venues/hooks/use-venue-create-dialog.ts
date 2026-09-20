import { useState } from 'react';

export interface VenueCreateDialog {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useVenueCreateDialog = (): VenueCreateDialog => {
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
