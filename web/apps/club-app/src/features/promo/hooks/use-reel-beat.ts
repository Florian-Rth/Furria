import { useSyncExternalStore } from 'react';
import { useReelClockContext } from './reel-clock-context';

export const useReelBeat = (live: boolean, sceneStartMs: number, atMs: number): boolean => {
  const clock = useReelClockContext();
  const reached = (): boolean => live && clock.elapsedMs() - sceneStartMs >= atMs;

  return useSyncExternalStore(clock.subscribe, reached);
};
