import { useEffect, useState } from 'react';
import { controlsShownOf, surfaceTapOf } from '../studio-d-practice';

const SLEEP_AFTER_MS = 3000;

export interface StudioDAwake {
  shown: boolean;
  tapSurface: () => void;
  nudge: () => void;
}

export const useStudioDAwake = (playing: boolean, holding: boolean): StudioDAwake => {
  const [awake, setAwake] = useState(true);
  const [nudges, setNudges] = useState(0);

  useEffect(() => {
    if (!playing || !awake || holding) {
      return;
    }

    const sleep = setTimeout(() => {
      setAwake(false);
    }, SLEEP_AFTER_MS);

    return () => {
      clearTimeout(sleep);
    };
  }, [playing, awake, holding, nudges]);

  const shown = controlsShownOf({ playing, awake, holding });

  const nudge = (): void => {
    setAwake(true);
    setNudges((count) => count + 1);
  };

  return {
    shown,
    nudge,
    tapSurface: () => {
      const tap = surfaceTapOf(shown, playing);
      if (tap === 'wake') {
        nudge();
      } else if (tap === 'sleep') {
        setAwake(false);
      }
    },
  };
};
