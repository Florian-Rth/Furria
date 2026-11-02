import { createContext, useContext } from 'react';
import type { TimelineDensity, TimelineWindow } from '../../timeline-geometry';

export interface TimelineState {
  length: number;
  density: TimelineDensity;
  window: TimelineWindow;
}

export const TimelineContext = createContext<TimelineState | null>(null);

export const useTimeline = (): TimelineState => {
  const state = useContext(TimelineContext);

  if (state === null) {
    throw new Error('A timeline layer was rendered outside Timeline.');
  }

  return state;
};
