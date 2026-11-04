import { useEffect, useState } from 'react';
import { UNDO_WINDOW_MS } from '@/features/lab-beer/beer-lab-ledger';

const TICK_MS = 200;

export interface BeerAUndoEntry {
  crateIds: readonly number[];
  openedAt: number;
}

export interface BeerAUndoWindow {
  entry: BeerAUndoEntry | null;
  remainingMs: number;
  open: (crateIds: readonly number[]) => void;
  close: () => void;
}

export const useUndoWindow = (onLapse: () => void): BeerAUndoWindow => {
  const [entry, setEntry] = useState<BeerAUndoEntry | null>(null);
  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    if (entry === null) {
      return;
    }

    const timer = window.setInterval(() => {
      const current = Date.now();
      setClock(current);

      if (current - entry.openedAt >= UNDO_WINDOW_MS) {
        setEntry(null);
        onLapse();
      }
    }, TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [entry, onLapse]);

  const open = (crateIds: readonly number[]): void => {
    const openedAt = Date.now();
    setClock(openedAt);
    setEntry({ crateIds, openedAt });
  };

  const close = (): void => {
    setEntry(null);
  };

  const remainingMs = entry === null ? 0 : Math.max(0, UNDO_WINDOW_MS - (clock - entry.openedAt));

  return { entry, remainingMs, open, close };
};
