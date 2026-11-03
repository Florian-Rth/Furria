import type { MixPlayer } from '@furria/studio/mix-player';
import type { TimelineRange } from '@furria/studio/music-timeline';
import { WHOLE_LABEL } from '@furria/studio/score-copy';
import type { ScoreModel } from '@furria/studio/score-model';
import { stepAtSeconds } from '@furria/studio/score-steps';
import type { AudioPeaks } from '@furria/studio/studio-schemas';
import { useMixPlayer } from '@furria/studio/use-mix-player';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import type { KkScoreLens } from '@furria/ui/KkScoreTransport';
import { useState } from 'react';

const WHOLE_LENS = 'all';

export interface ScorePlayer {
  player: MixPlayer;
  playing: boolean;
  canPlay: boolean;
  length: number;
  peaks: ReadonlyMap<number, AudioPeaks>;
  focus: TimelineRange | null;
  lens: string;
  lenses: KkScoreLens[];
  activeStepId: number | null;
  setLens: (id: string) => void;
  toggle: () => void;
  seekTo: (seconds: number) => void;
}

export const useScorePlayer = (
  model: ScoreModel,
  wide: boolean,
  peaks: ReadonlyMap<number, AudioPeaks>,
): ScorePlayer => {
  const { player, state } = useMixPlayer(model.segments);
  const [lens, setLens] = useState(WHOLE_LENS);
  const activeStepId = usePlaybackSelection(player, (seconds) =>
    seconds > 0 ? (stepAtSeconds(model.steps, seconds)?.stepId ?? null) : null,
  );
  const part = model.parts.find((candidate) => String(candidate.partId) === lens) ?? null;
  const lenses = [
    { id: WHOLE_LENS, label: WHOLE_LABEL },
    ...model.parts
      .filter((candidate) => candidate.range !== null)
      .map((candidate) => ({ id: String(candidate.partId), label: candidate.name })),
  ];

  return {
    player,
    playing: state.playing,
    canPlay: state.load !== 'failed' && model.segments.some((segment) => segment.audible),
    length: model.length,
    peaks,
    focus: wide ? (part?.range ?? null) : null,
    lens,
    lenses,
    activeStepId,
    setLens,
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
