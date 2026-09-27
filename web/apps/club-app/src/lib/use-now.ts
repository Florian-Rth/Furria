import { useEffect, useState } from 'react';

export const useNow = (intervalMs: number, isTicking = true): Date => {
  const [now, setNow] = useState(() => new Date());
  const [wasTicking, setWasTicking] = useState(isTicking);

  if (isTicking !== wasTicking) {
    setWasTicking(isTicking);
    if (isTicking) {
      setNow(new Date());
    }
  }

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
