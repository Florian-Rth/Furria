import { useEffect, useRef, useState } from 'react';
import type { ReelClock } from './reel-clock';

const LONGEST_STEP_MS = 1000;

export const useReelClock = (paused: boolean): ReelClock => {
  const elapsed = useRef(0);
  const pausedNow = useRef(paused);
  const listeners = useRef(new Set<() => void>());
  const [clock] = useState<ReelClock>(() => ({
    elapsedMs: () => elapsed.current,
    subscribe: (listener) => {
      listeners.current.add(listener);
      return () => {
        listeners.current.delete(listener);
      };
    },
  }));

  pausedNow.current = paused;

  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const tick = (now: number): void => {
      const step = Math.min(now - last, LONGEST_STEP_MS);

      last = now;
      if (!pausedNow.current) {
        elapsed.current += step;
        for (const listener of listeners.current) {
          listener();
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return clock;
};
