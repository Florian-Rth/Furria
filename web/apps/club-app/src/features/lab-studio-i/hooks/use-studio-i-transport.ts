import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import {
  PRACTICE_PAUSE,
  PRACTICE_PLAY,
  rateLabelOf,
  rateTextOf,
} from '@/features/act-practice/practice-copy';
import { nextRateOf, ratePercentOf } from '@/features/act-practice/practice-stepping';
import { MUSIC_STATUS, statusTextOf } from '../studio-i-copy';
import type { StudioIEdit } from './use-studio-i-edit';

export interface StudioITransport {
  playing: boolean;
  playLabel: string;
  canPlay: boolean;
  canBack: boolean;
  canForward: boolean;
  status: string;
  statusKey: string;
  rateText: string;
  rateLabel: string;
  slowed: boolean;
  toggle: () => void;
  back: () => void;
  forward: () => void;
  slowDown: () => void;
}

export const useStudioITransport = (
  playback: StudioPlayback,
  edit: StudioIEdit,
  total: number,
): StudioITransport => {
  const { state, controls, player } = playback;
  const percent = ratePercentOf(state.rate);
  const onStep = edit.span !== null;

  return {
    playing: state.playing,
    playLabel: state.playing ? PRACTICE_PAUSE : PRACTICE_PLAY,
    canPlay: state.load === 'ready',
    canBack: onStep,
    canForward: edit.index < total - 1,
    status: onStep ? statusTextOf(state.playing, edit.index + 1) : MUSIC_STATUS,
    statusKey: `${edit.index}-${state.playing}`,
    rateText: rateTextOf(percent),
    rateLabel: rateLabelOf(percent),
    slowed: state.rate < 1,
    toggle: controls.toggle,
    back: () => {
      edit.go('back');
    },
    forward: () => {
      edit.go('forward');
    },
    slowDown: () => {
      controls.setRate(nextRateOf(player.state().rate));
    },
  };
};
