import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Practice } from '@/features/act-practice/hooks/use-practice';
import { usePractice } from '@/features/act-practice/hooks/use-practice';
import { usePracticeMemory } from '@/features/act-practice/hooks/use-practice-memory';
import type { PracticeSteps } from '@/features/act-practice/hooks/use-practice-steps';
import { usePracticeSteps } from '@/features/act-practice/hooks/use-practice-steps';
import type { PracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { usePracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { canPractise } from '@/features/acts/act-studio';
import type { Studio } from '@/features/acts/schemas';
import type { SongMutations, StepMutations } from '../api';
import { useSongMutations, useStepMutations } from '../api';
import { workedPathsOf, workedStepsOf, workedStudioOf } from '../studio-edits';
import type { ActStudioFrame } from '../studio-layout';
import { studioFrameOf } from '../studio-layout';
import type { ActStudioEdits } from './use-act-studio-edits';
import { useActStudioEdits, useKeptPosition } from './use-act-studio-edits';
import type { ActStudioMode } from './use-act-studio-mode';
import { useActStudioMode } from './use-act-studio-mode';

export interface StudioScreen {
  actId: number;
  music: SongMutations;
  manual: StepMutations;
  mode: ActStudioMode;
  frame: ActStudioFrame;
  edits: ActStudioEdits;
  studio: Studio;
  playback: StudioPlayback;
  practice: Practice;
  video: PracticeVideo;
  steps: PracticeSteps;
}

export const useStudioScreen = (
  actId: number,
  source: Studio,
  viewerId: number | null,
  canEdit: boolean,
): StudioScreen => {
  const mode = useActStudioMode(canEdit, !canPractise(source));
  const music = useSongMutations(actId);
  const manual = useStepMutations(actId);
  const edits = useActStudioEdits();
  const studio = workedStudioOf(source, edits.value);
  const base = useStudioPlayback(studio, viewerId);
  const playback: StudioPlayback = {
    ...base,
    steps: workedStepsOf(base.steps, edits.value),
    paths: workedPathsOf(base.paths, edits.value),
  };
  useKeptPosition(base.player, edits.keep);
  const practice = usePractice(playback);
  const video = usePracticeVideo(studio, playback);
  const steps = usePracticeSteps(studio, playback, practice);
  usePracticeMemory({ actId, personId: viewerId }, playback, practice.step?.stepId ?? null);

  return {
    actId,
    mode,
    music,
    manual,
    frame: studioFrameOf(mode.editing, mode.tool, video.hero),
    edits,
    studio,
    playback,
    practice,
    video,
    steps,
  };
};
