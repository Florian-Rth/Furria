import { markSecondsOf } from '@/features/act-studio/studio-steps';
import type { LaneEditor } from './use-lane-editor';

export interface LaneMark {
  locked: boolean;
  press: () => void;
}

export const useLaneMark = (lane: LaneEditor): LaneMark => {
  const { playback, manual } = lane.screen;

  return {
    locked: playback.length <= 0 || manual.mark.isPending,
    press: () => {
      manual.mark.mutate(markSecondsOf(playback, playback.player.position()));
    },
  };
};
