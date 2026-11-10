import { createContext, useContext } from 'react';
import type { ReelClock } from './reel-clock';

export const ReelClockContext = createContext<ReelClock | null>(null);

export const useReelClockContext = (): ReelClock => {
  const clock = useContext(ReelClockContext);

  if (clock === null) {
    throw new Error('useReelClockContext must be used inside ReelClockContext');
  }

  return clock;
};
