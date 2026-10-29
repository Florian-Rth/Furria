import { useState } from 'react';
import type { LineKey } from '@/features/running-order/schemas';

export interface WishBoard {
  eveningFormOpen: boolean;
  addingKey: LineKey | null;
  toggleEveningForm: () => void;
  closeEveningForm: () => void;
  toggleAdding: (key: LineKey) => void;
}

export const useWishBoard = (): WishBoard => {
  const [eveningFormOpen, setEveningFormOpen] = useState(false);
  const [addingKey, setAddingKey] = useState<LineKey | null>(null);

  return {
    eveningFormOpen,
    addingKey,
    toggleEveningForm: () => {
      setEveningFormOpen((open) => !open);
    },
    closeEveningForm: () => {
      setEveningFormOpen(false);
    },
    toggleAdding: (key) => {
      setAddingKey((current) => (current === key ? null : key));
    },
  };
};
