import type { KkScoreTrackTick } from '@furria/ui/KkScoreTrack';
import type { KkScoreLens } from '@furria/ui/KkScoreTransport';
import { useState } from 'react';
import { useAudioPeaks } from '@/features/act-player/api';
import { useMixPlayer } from '@/features/act-player/hooks/use-mix-player';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { waveformOf } from '@/features/act-player/mix-waveform';
import { clockOf, WHOLE_LABEL } from '../score-copy';
import type { ScoreModel } from '../score-model';
import type { ScoreZoom } from '../score-ruler';
import { rulerTicksOf, shareToSeconds, WHOLE_ZOOM, zoomOf } from '../score-ruler';
import { stepAtSeconds } from '../score-steps';

const WIDE_BARS = 720;
const STRIP_BARS = 200;
const WHOLE_LENS = 'all';

export interface ScorePlayer {
  player: MixPlayer;
  playing: boolean;
  canPlay: boolean;
  length: number;
  bars: number[];
  ticks: KkScoreTrackTick[];
  zoom: ScoreZoom;
  lens: string;
  lenses: KkScoreLens[];
  activeStepId: number | null;
  setLens: (id: string) => void;
  toggle: () => void;
  seekShare: (share: number) => void;
  seekTo: (seconds: number) => void;
}

export const useScorePlayer = (model: ScoreModel, wide: boolean): ScorePlayer => {
  const { player, state } = useMixPlayer(model.segments);
  const peaks = useAudioPeaks(model.segments);
  const [lens, setLens] = useState(WHOLE_LENS);
  const activeStepId = usePlaybackSelection(player, (seconds) =>
    seconds > 0 ? (stepAtSeconds(model.steps, seconds)?.stepId ?? null) : null,
  );
  const part = model.parts.find((candidate) => String(candidate.partId) === lens) ?? null;
  const zoom = wide && part !== null ? zoomOf(part.range, model.length) : WHOLE_ZOOM;
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
    bars: waveformOf(model.segments, peaks, wide ? WIDE_BARS : STRIP_BARS),
    ticks: rulerTicksOf(model.length, zoom).map((tick) => ({
      share: tick.share,
      label: clockOf(tick.seconds),
    })),
    zoom,
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
    seekShare: (share) => {
      player.seek(shareToSeconds(share, model.length));
    },
    seekTo: (seconds) => {
      player.seek(seconds);
    },
  };
};
