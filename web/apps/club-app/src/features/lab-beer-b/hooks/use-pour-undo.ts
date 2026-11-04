import { useEffect, useState } from 'react';
import { UNDO_WINDOW_MS } from '@/features/lab-beer/beer-lab-ledger';

export interface PourPendingUndo {
  crateIds: readonly number[];
  runKey: number;
}

export interface PourUndoControl {
  pending: PourPendingUndo | null;
  runs: number;
  start: (crateIds: readonly number[]) => void;
  clear: () => void;
}

export const usePourUndo = (): PourUndoControl => {
  const [pending, setPending] = useState<PourPendingUndo | null>(null);
  const [runs, setRuns] = useState(0);

  useEffect(() => {
    if (pending === null) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPending(null);
    }, UNDO_WINDOW_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pending]);

  const start = (crateIds: readonly number[]): void => {
    const runKey = runs + 1;
    setRuns(runKey);
    setPending({ crateIds, runKey });
  };

  const clear = (): void => {
    setPending(null);
  };

  return { pending, runs, start, clear };
};
