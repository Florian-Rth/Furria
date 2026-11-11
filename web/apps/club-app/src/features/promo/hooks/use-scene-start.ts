import { useState } from 'react';
import { useReelClockContext } from './reel-clock-context';

export const useSceneStart = (live: boolean): number => {
  const clock = useReelClockContext();
  const [wasLive, setWasLive] = useState(live);
  const [startMs, setStartMs] = useState(() => clock.elapsedMs());

  if (live !== wasLive) {
    setWasLive(live);
    if (live) {
      setStartMs(clock.elapsedMs());
    }
  }

  return startMs;
};
