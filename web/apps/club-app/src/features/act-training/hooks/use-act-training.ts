import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { countAt } from '@/features/act-player/music-timeline';
import { usePractice } from '@/features/act-practice/hooks/use-practice';
import type { Studio, StudioTraining } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { attendanceTallyOf, castAttendanceOf } from '../training-attendance';
import {
  TRAINING_BACK,
  TRAINING_LOOP,
  TRAINING_NO_STEP,
  TRAINING_PAUSE,
  TRAINING_PLAY,
  trainingCountLabelOf,
  trainingGapsTextOf,
  trainingStepMetaOf,
  trainingTallyOf,
  trainingTitleOf,
} from '../training-copy';
import { stepPositionOf, trainingGapsOf, trainingStudioOf } from '../training-gaps';
import { useScreenWakeLock } from './use-screen-wake-lock';

const NO_VIEWER = null;

export interface ActTraining {
  studio: Studio;
  playback: StudioPlayback;
  title: string;
  tally: string | null;
  gaps: string | null;
  count: number | null;
  countLabel: string;
  stepName: string;
  stepMeta: string | null;
  playing: boolean;
  playLabel: string;
  backLabel: string;
  loopLabel: string;
  looping: boolean;
  canPlay: boolean;
  canLoop: boolean;
  toggle: () => void;
  back: () => void;
  loop: () => void;
}

export const useActTraining = (
  source: Studio,
  training: StudioTraining | null,
  cast: readonly CastPerson[],
): ActTraining => {
  useScreenWakeLock();
  const studio = trainingStudioOf(source, training);
  const playback = useStudioPlayback(studio, NO_VIEWER);
  const practice = usePractice(playback);
  const count = usePlaybackSelection(
    playback.player,
    (seconds) => countAt(playback.segments, seconds)?.count ?? null,
  );
  const gaps = trainingGapsOf(training, source.spots, playback.paths, playback.steps);
  const looping = practice.loopKind === 'step';

  return {
    studio,
    playback,
    title: trainingTitleOf(training),
    tally:
      training === null
        ? null
        : trainingTallyOf(attendanceTallyOf(castAttendanceOf(cast, training))),
    gaps: trainingGapsTextOf(gaps),
    count,
    countLabel: trainingCountLabelOf(count),
    stepName: practice.step?.name ?? TRAINING_NO_STEP,
    stepMeta: trainingStepMetaOf(
      stepPositionOf(playback.steps, practice.step?.stepId ?? null),
      playback.steps.length,
      practice.partName,
    ),
    playing: practice.playing,
    playLabel: practice.playing ? TRAINING_PAUSE : TRAINING_PLAY,
    backLabel: TRAINING_BACK,
    loopLabel: TRAINING_LOOP,
    looping,
    canPlay: practice.canPlay,
    canLoop: practice.canPlay && practice.canStep,
    toggle: practice.toggle,
    back: () => {
      practice.skip('back');
    },
    loop: () => {
      if (practice.step === null) {
        return;
      }
      practice.loopStep(practice.step.stepId);
      if (!looping && !practice.playing) {
        practice.toggle();
      }
    },
  };
};
