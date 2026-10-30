import { useEffect, useState } from 'react';

const TICK_MS = 1000;

export const useNowMs = (): number => {
  const [nowMs, setNowMs] = useState(Date.now);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return nowMs;
};
