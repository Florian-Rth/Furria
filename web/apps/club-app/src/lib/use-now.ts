import { useEffect, useState } from 'react';

export const useNow = (intervalMs: number, isTicking = true): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!isTicking) {
      return;
    }

    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [intervalMs, isTicking]);

  return now;
};
