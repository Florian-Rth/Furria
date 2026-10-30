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
import type { Studio, StudioEvening } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import type { SongMutations, StepMutations, VideoMutations } from '../api';
import { useSongMutations, useStepMutations, useVideoMutations } from '../api';
import { useEveningStageMutations } from '../evening-api';
import type { StageMutations } from '../stage-api';
import { useStageMutations } from '../stage-api';
import { workedPathsOf, workedStepsOf, workedStudioOf } from '../studio-edits';
import { eveningStudioOf } from '../studio-evening';
import type { ActStudioFrame } from '../studio-layout';
import { studioFrameOf } from '../studio-layout';
import type { ActStudioEdits } from './use-act-studio-edits';
import { useActStudioEdits, useKeptPosition } from './use-act-studio-edits';
import type { ActStudioMode } from './use-act-studio-mode';
import { useActStudioMode } from './use-act-studio-mode';
import { useStudioDeveloping } from './use-studio-developing';
import { useVideoAutoAlign } from './use-video-auto-align';

export interface StudioEveningContext {
  evening: StudioEvening | null;
  startEditing: boolean;
}

export interface StudioScreen {
  actId: number;
  evening: StudioEvening | null;
  music: SongMutations;
  stageWrites: StageMutations;
  cast: readonly CastPerson[];
  manual: StepMutations;
  videos: VideoMutations;
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
  cast: readonly CastPerson[],
  { evening, startEditing }: StudioEveningContext,
): StudioScreen => {
  const mode = useActStudioMode(canEdit, {
    silent: !canPractise(source),
    evening: evening !== null,
    editing: startEditing,
  });
  const music = useSongMutations(actId);
  const stageWrites = useEveningStageMutations(
    actId,
    evening?.eventId ?? null,
    useStageMutations(actId),
  );
  const manual = useStepMutations(actId);
  const videos = useVideoMutations(actId);
  useVideoAutoAlign(source, canEdit, videos);
  useStudioDeveloping(actId, source);
  const edits = useActStudioEdits();
  const studio = workedStudioOf(eveningStudioOf(source, evening, cast), edits.value);
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
    evening,
    mode,
    music,
    stageWrites,
    cast,
    manual,
    videos,
    frame: studioFrameOf(mode.editing, mode.tool, video.hero),
    edits,
    studio,
    playback,
    practice,
    video,
    steps,
  };
};
