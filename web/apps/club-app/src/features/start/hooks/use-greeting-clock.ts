import { useEffect, useState } from 'react';
import { greetingTickDelayOf } from '../greeting/greeting-stage';

export const useGreetingClock = (everySecond: boolean): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setNow(new Date());
      },
      greetingTickDelayOf(now, everySecond),
    );

    return () => {
      clearTimeout(timer);
    };
  }, [now, everySecond]);

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
