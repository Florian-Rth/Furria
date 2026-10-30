import { useEffect, useState } from 'react';
import { elapsedSecondsOf } from '@/features/live/live-flow';
import { elapsedTextOf } from '../heute-board';

const TICK_MS = 1000;

export const useElapsedText = (since: string | null): string | null => {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (since === null) {
      return;
    }
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [since]);

  return since === null ? null : elapsedTextOf(elapsedSecondsOf(since, nowMs));
};
