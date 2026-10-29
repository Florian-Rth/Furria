import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import {
  countLabelOf,
  eightLabelOf,
  factsOf,
  STUDIO_A_NO_STEPS,
  stepOfLabel,
} from '../studio-a-copy';
import { beatIndexAt, beatOf } from '../studio-a-practice';
import type { StudioAPractice } from './use-studio-a-practice';

export interface StudioACount {
  count: number | null;
  countLabel: string;
  title: string;
  meta: string;
}

export const useStudioACount = (
  playback: StudioPlayback,
  practice: StudioAPractice,
): StudioACount => {
  const { player, countMarks, steps } = playback;
  const beatIndex = usePlaybackSelection(player, (seconds) => beatIndexAt(countMarks, seconds));
  const beat = beatOf(countMarks, beatIndex, practice.step);
  const count = beat?.count ?? null;
  const stepLabel =
    practice.stepNumber === null ? null : stepOfLabel(practice.stepNumber, steps.length);

  return {
    count,
    countLabel: countLabelOf(count),
    title: practice.step?.name ?? STUDIO_A_NO_STEPS,
    meta: factsOf([
      practice.part?.name ?? null,
      eightLabelOf(beat?.eight ?? null, beat?.eights ?? null),
      stepLabel,
    ]),
  };
};
