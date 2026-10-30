import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Practice } from '@/features/act-practice/hooks/use-practice';
import { usePractice } from '@/features/act-practice/hooks/use-practice';
import { usePracticeMemory } from '@/features/act-practice/hooks/use-practice-memory';
import type { PracticeSteps } from '@/features/act-practice/hooks/use-practice-steps';
import { usePracticeSteps } from '@/features/act-practice/hooks/use-practice-steps';
import type { PracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { usePracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import type { Studio } from '@/features/acts/schemas';
import { workedPathsOf, workedStepsOf, workedStudioOf } from '../studio-h-edits';
import type { StudioHFrame } from '../studio-h-layout';
import { studioFrameOf } from '../studio-h-layout';
import type { StudioHEdits } from './use-studio-h-edits';
import { useKeptPosition, useStudioHEdits } from './use-studio-h-edits';
import type { StudioHMode } from './use-studio-h-mode';
import { useStudioHMode } from './use-studio-h-mode';

export interface StudioH {
  mode: StudioHMode;
  frame: StudioHFrame;
  edits: StudioHEdits;
  studio: Studio;
  playback: StudioPlayback;
  practice: Practice;
  video: PracticeVideo;
  steps: PracticeSteps;
}

export const useStudioH = (
  actId: number,
  source: Studio,
  viewerId: number | null,
  canEdit: boolean,
): StudioH => {
  const mode = useStudioHMode(canEdit);
  const edits = useStudioHEdits();
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
    mode,
    frame: studioFrameOf(mode.editing, mode.tool, video.hero),
    edits,
    studio,
    playback,
    practice,
    video,
    steps,
  };
};
