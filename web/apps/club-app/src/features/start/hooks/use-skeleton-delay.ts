import { useEffect, useState } from 'react';

const SKELETON_DELAY_MS = 300;

export const useSkeletonDelay = (waiting: boolean): boolean => {
  const [due, setDue] = useState(false);

  if (!waiting && due) {
    setDue(false);
  }

  useEffect(() => {
    if (!waiting) {
      return;
    }

    const timer = setTimeout(() => {
      setDue(true);
    }, SKELETON_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [waiting]);

  return waiting && due;
};
