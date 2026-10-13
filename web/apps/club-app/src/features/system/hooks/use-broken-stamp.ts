import { useEffect, useState } from 'react';

const STAMP_DELAY_MS = 1600;

export const useBrokenStamp = (isBroken: boolean): number => {
  const [fireKey, setFireKey] = useState(0);

  useEffect(() => {
    if (!isBroken) {
      return;
    }

    const timer = setTimeout(() => {
      setFireKey((current) => current + 1);
    }, STAMP_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [isBroken]);

  return fireKey;
};
