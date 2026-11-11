import type { RefObject } from 'react';
import { useRef, useState } from 'react';
import { resolveLoopOutcome } from '@/features/club/season-content';

export interface SeasonLoop {
  openingRef: RefObject<HTMLDivElement | null>;
  replayCount: number;
  diagnosisKey: number;
  loopBack: () => void;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const useSeasonLoop = (): SeasonLoop => {
  const openingRef = useRef<HTMLDivElement>(null);
  const [loopCount, setLoopCount] = useState(0);
  const [replayCount, setReplayCount] = useState(0);
  const [diagnosisKey, setDiagnosisKey] = useState(0);

  const loopBack = (): void => {
    const nextLoopCount = loopCount + 1;
    setLoopCount(nextLoopCount);

    if (resolveLoopOutcome(nextLoopCount) === 'diagnosis') {
      setDiagnosisKey((key) => key + 1);
      return;
    }

    const reducesMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    openingRef.current?.scrollIntoView({
      behavior: reducesMotion ? 'auto' : 'smooth',
      block: 'center',
    });
    setReplayCount((count) => count + 1);
  };

  return { openingRef, replayCount, diagnosisKey, loopBack };
};
