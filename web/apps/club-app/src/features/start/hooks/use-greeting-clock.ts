import { useEffect, useState } from 'react';
import { greetingTickDelayOf } from '../greeting/greeting-stage';

const shiftedNow = (shiftMs: number): Date => new Date(Date.now() + shiftMs);

export const useGreetingClock = (everySecond: boolean, shiftMs: number): Date => {
  const [now, setNow] = useState(() => shiftedNow(shiftMs));

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setNow(shiftedNow(shiftMs));
      },
      greetingTickDelayOf(now, everySecond),
    );

    return () => {
      clearTimeout(timer);
    };
  }, [now, everySecond, shiftMs]);

  useEffect(() => {
    const catchUp = (): void => {
      if (document.visibilityState === 'visible') {
        setNow(shiftedNow(shiftMs));
      }
    };

    document.addEventListener('visibilitychange', catchUp);

    return () => {
      document.removeEventListener('visibilitychange', catchUp);
    };
  }, [shiftMs]);

  return now;
};
