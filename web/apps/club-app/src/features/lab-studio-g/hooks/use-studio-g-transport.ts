import { stepRangeOf } from '@/features/act-player/music-timeline';
import type { Practice } from '@/features/act-practice/hooks/use-practice';
import { LOOP_SELECTION, LOOP_STEP } from '../studio-g-copy';
import type { StudioGDesk } from '../studio-g-desk';
import { selectionRangeOf } from '../studio-g-ranges';

export interface StudioGTransport {
  loopLabel: string;
  looping: boolean;
  loop: () => void;
  back: () => void;
  forward: () => void;
}

export const useStudioGTransport = (desk: StudioGDesk, practice: Practice): StudioGTransport => {
  const { playback, studio, picked } = desk;
  const { player, state, segments, steps, parts } = playback;
  const chosen = selectionRangeOf(picked.selection, {
    segments,
    steps,
    parts,
    videos: studio.videos,
  });

  return {
    loopLabel: chosen === null ? LOOP_STEP : LOOP_SELECTION,
    looping: state.loop !== null,
    loop: () => {
      if (player.state().loop !== null) {
        player.setLoop(null);
        return;
      }
      const range = chosen ?? (practice.step === null ? null : stepRangeOf(practice.step));
      if (range !== null) {
        player.setLoop(range);
        player.seek(range.start);
      }
    },
    back: () => {
      practice.skip('back');
    },
    forward: () => {
      practice.skip('forward');
    },
  };
};
