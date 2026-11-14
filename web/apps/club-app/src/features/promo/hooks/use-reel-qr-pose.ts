import type { KkPromoQrPose } from '@furria/ui/promo-stage-types';
import { useSyncExternalStore } from 'react';
import type { ReelScene } from '../reel-timeline';
import { reelPositionOf, reelQrPoseOf } from '../reel-timeline';
import type { ReelClock } from './reel-clock';

export const useReelQrPose = (
  clock: ReelClock,
  firstLoop: readonly ReelScene[],
  laterLoop: readonly ReelScene[],
): KkPromoQrPose => {
  const snapshot = (): KkPromoQrPose =>
    reelQrPoseOf(reelPositionOf(clock.elapsedMs(), firstLoop, laterLoop), firstLoop, laterLoop);

  return useSyncExternalStore(clock.subscribe, snapshot);
};
