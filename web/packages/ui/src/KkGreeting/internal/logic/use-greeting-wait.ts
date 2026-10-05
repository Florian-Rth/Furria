import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { useScreenArrivalHold } from '../../../KkShell/internal/logic/screen-arrival';
import { kkTokens } from '../../../tokens';

const { hingeMs } = kkTokens.motion.greeting;

export const useGreetingWait = (): void => {
  const reducedMotion = useReducedMotion();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setExpired(true);
    }, hingeMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useScreenArrivalHold(!expired && !reducedMotion);
};
