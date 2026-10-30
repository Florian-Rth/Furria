import { useKkNotice } from '@furria/ui/KkNotice';
import { useEffect, useState } from 'react';

export interface DeskTarget {
  targetId: number | null;
  open: (id: number) => void;
  close: () => void;
}

export const useDeskTarget = (
  known: readonly number[],
  active: boolean,
  goneMessage: string,
): DeskTarget => {
  const raise = useKkNotice();
  const [targetId, setTargetId] = useState<number | null>(null);
  const [goneId, setGoneId] = useState<number | null>(null);
  if (targetId !== null && !active) {
    setTargetId(null);
  } else if (targetId !== null && !known.includes(targetId)) {
    setTargetId(null);
    setGoneId(targetId);
  }

  useEffect(() => {
    if (goneId === null) {
      return;
    }
    raise({ tone: 'info', message: goneMessage });
    setGoneId(null);
  }, [goneId, goneMessage, raise]);

  return {
    targetId,
    open: (id) => {
      setTargetId(active ? id : null);
    },
    close: () => {
      setTargetId(null);
    },
  };
};
