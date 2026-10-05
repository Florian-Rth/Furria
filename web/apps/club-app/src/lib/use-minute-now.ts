import { useEffect, useState } from 'react';
import { msUntilNextMinute } from './minute-clock';

export const useMinuteNow = (): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setTimeout(() => {
      setNow(new Date());
    }, msUntilNextMinute(now));

    return () => {
      clearTimeout(timer);
    };
  }, [now]);

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
