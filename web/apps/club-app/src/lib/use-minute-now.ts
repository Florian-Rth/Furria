import { useEffect, useState } from 'react';
import { msUntilNextMinute } from './minute-clock';

export const useMinuteNow = (ticking = true): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!ticking) {
      return;
    }

    const timer = setTimeout(() => {
      setNow(new Date());
    }, msUntilNextMinute(now));

    return () => {
      clearTimeout(timer);
    };
  }, [now, ticking]);

  useEffect(() => {
    const catchUp = (): void => {
      if (document.visibilityState === 'visible') {
        setNow(new Date());
      }
    };

    document.addEventListener('visibilitychange', catchUp);

    return () => {
      document.removeEventListener('visibilitychange', catchUp);
    };
  }, []);

  return now;
};
