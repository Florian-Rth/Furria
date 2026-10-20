import { useState } from 'react';
import type { KkStepState } from '../KkStatePill/step-state';

export const useDoneFlip = (state: KkStepState): number => {
  const [seenState, setSeenState] = useState(state);
  const [flips, setFlips] = useState(0);

  if (seenState !== state) {
    setSeenState(state);
    if (state === 'done') {
      setFlips(flips + 1);
    }
  }

  return flips;
};
