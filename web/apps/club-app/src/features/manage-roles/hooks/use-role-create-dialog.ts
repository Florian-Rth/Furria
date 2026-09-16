import { useState } from 'react';

export interface RoleCreateDialog {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useRoleCreateDialog = (): RoleCreateDialog => {
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
