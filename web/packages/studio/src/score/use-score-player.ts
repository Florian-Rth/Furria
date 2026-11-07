import type { MixPlayer } from '@furria/studio/mix-player';
import type { ScoreModel } from '@furria/studio/score-model';
import { stepAtSeconds } from '@furria/studio/score-steps';
import type { AudioPeaks } from '@furria/studio/studio-schemas';
import { useMixPlayer } from '@furria/studio/use-mix-player';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';

export interface ScorePlayer {
  player: MixPlayer;
  playing: boolean;
  canPlay: boolean;
  length: number;
  peaks: ReadonlyMap<number, AudioPeaks>;
  activeStepId: number | null;
  toggle: () => void;
  seekTo: (seconds: number) => void;
}

export const useScorePlayer = (
  model: ScoreModel,
  peaks: ReadonlyMap<number, AudioPeaks>,
): ScorePlayer => {
  const { player, state } = useMixPlayer(model.segments);
  const activeStepId = usePlaybackSelection(player, (seconds) =>
    seconds > 0 ? (stepAtSeconds(model.steps, seconds)?.stepId ?? null) : null,
  );

  return {
    player,
    playing: state.playing,
    canPlay: state.load !== 'failed' && model.segments.some((segment) => segment.audible),
    length: model.length,
    peaks,
    activeStepId,
    toggle: () => {
      if (player.state().playing) {
        player.pause();
      } else {
        player.play();
      }
    },
    seekTo: (seconds) => {
      player.seek(seconds);
    },
  };
};
