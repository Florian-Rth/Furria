import { useSyncExternalStore } from 'react';
import type { ReelPosition, ReelScene } from '../reel-timeline';
import { reelPositionOf } from '../reel-timeline';
import type { ReelClock } from './reel-clock';

const positionKeyOf = (position: ReelPosition): string => `${position.loop}:${position.index}`;

export const useReelPosition = (
  clock: ReelClock,
  firstLoop: readonly ReelScene[],
  laterLoop: readonly ReelScene[],
  leaveMs: number,
): ReelPosition => {
  const snapshot = (): string => {
    const position = reelPositionOf(clock.elapsedMs(), firstLoop, laterLoop);
    const leaving = position.sceneMs < leaveMs ? 'leaving' : 'settled';

    return `${positionKeyOf(position)}:${leaving}`;
  };
  const key = useSyncExternalStore(clock.subscribe, snapshot);
  const [loop = 0, index = 0, leaving = 'settled'] = key.split(':');

  return {
    loop: Number(loop),
    index: Number(index),
    sceneMs: leaving === 'leaving' ? 0 : leaveMs,
  };
};
