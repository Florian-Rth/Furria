import { musicSegmentsOf } from '@furria/studio/music-timeline';
import { playerKeyActionsOf } from '@furria/studio/practice-key-actions';
import type { Practice } from '@furria/studio/use-practice';
import { usePractice } from '@furria/studio/use-practice';
import { usePracticeMemory } from '@furria/studio/use-practice-memory';
import type { PracticeSteps } from '@furria/studio/use-practice-steps';
import { usePracticeSteps } from '@furria/studio/use-practice-steps';
import type { PracticeVideo } from '@furria/studio/use-practice-video';
import { usePracticeVideo } from '@furria/studio/use-practice-video';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import type { StudioPlayback } from '@furria/studio/use-studio-playback';
import { useStudioPlayback } from '@furria/studio/use-studio-playback';
import { useKkLaneWide } from '@furria/ui/KkLaneWide';
import { canPractise } from '@/features/acts/act-studio';
import { useAudioPeaks } from '@/features/acts/api';
import type { ActStudio, StudioEvening } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { useLargeText } from '@/lib/use-large-text';
import type { SongMutations, VideoMutations } from '../api';
import { useSongMutations, useVideoMutations } from '../api';
import type { StudioTool } from '../studio-copy';
import { eveningBandOf } from '../studio-copy';
import { workedPathsOf } from '../studio-edits';
import { eveningStudioOf } from '../studio-evening';
import type { ActStudioFrame } from '../studio-layout';
import { largeTextFrameOf } from '../studio-layout';
import type { StudioEditor } from '../studio-mode';
import { studioEditorOf } from '../studio-mode';
import type { ActStudioEdits } from './use-act-studio-edits';
import { useActStudioEdits, useKeptPosition } from './use-act-studio-edits';
import type { ActStudioMode } from './use-act-studio-mode';
import { useActStudioMode } from './use-act-studio-mode';
import { useStudioDeveloping } from './use-studio-developing';
import type { StudioDocumentEdit } from './use-studio-document';
import { useStudioDocument } from './use-studio-document';
import type { StudioFinal } from './use-studio-final';
import { useStudioFinal } from './use-studio-final';
import type { StudioLargeText } from './use-studio-large-text';
import { useStudioLargeText } from './use-studio-large-text';
import { useVideoAutoAlign } from './use-video-auto-align';

export interface StudioEveningContext {
  evening: StudioEvening | null;
  startEditing: boolean;
  startHall: (() => void) | null;
  startTool?: StudioTool;
  stageEditor?: boolean;
}

export interface StudioScreen {
  actId: number;
  evening: StudioEvening | null;
  eveningBand: string | null;
  music: SongMutations;
  stageDocument: StudioDocumentEdit;
  cast: readonly CastPerson[];
  document: StudioDocumentEdit;
  videos: VideoMutations;
  final: StudioFinal;
  mode: ActStudioMode;
  editor: StudioEditor | null;
  frame: ActStudioFrame;
  large: StudioLargeText;
  startHall: (() => void) | null;
  edits: ActStudioEdits;
  studio: ActStudio;
  playback: StudioPlayback;
  practice: Practice;
  video: PracticeVideo;
  steps: PracticeSteps;
}

export const useStudioScreen = (
  actId: number,
  source: ActStudio,
  viewerId: number | null,
  canEdit: boolean,
  cast: readonly CastPerson[],
  { evening, startEditing, startHall, startTool, stageEditor = false }: StudioEveningContext,
): StudioScreen => {
  const wide = useKkLaneWide();
  const mode = useActStudioMode(canEdit, {
    silent: !canPractise(source),
    evening: evening !== null,
    editing: startEditing,
    stageOnly: stageEditor,
    tool: startTool ?? null,
  });
  const music = useSongMutations(actId);
  const work = useStudioDocument({ actId, eventId: null }, source);
  const stageDocument = useStudioDocument({ actId, eventId: evening?.eventId ?? null }, source);
  const videos = useVideoMutations(actId);
  useVideoAutoAlign(source, canEdit, videos);
  useStudioDeveloping(actId, source);
  const edits = useActStudioEdits();
  const { studio, final } = useStudioFinal(
    actId,
    eveningStudioOf(work.studio, stageDocument.studio, evening, cast),
    mode,
    edits,
  );
  const peaksByItem = useAudioPeaks(musicSegmentsOf(studio));
  const base = useStudioPlayback(studio, viewerId, peaksByItem);
  const playback: StudioPlayback = {
    ...base,
    paths: workedPathsOf(base.paths, edits.value),
  };
  useKeptPosition(base.player, edits.keep);
  const practice = usePractice(playback);
  const video = usePracticeVideo(studio, playback);
  const steps = usePracticeSteps(studio, playback, practice);
  usePracticeMemory({ actId, personId: viewerId }, playback, practice.step?.stepId ?? null);
  const large = useStudioLargeText(useLargeText() && !mode.editing);
  useStudioKeys(playerKeyActionsOf(practice), large.on && !mode.editing && !steps.open);

  return {
    actId,
    evening,
    eveningBand:
      evening !== null && mode.editing ? eveningBandOf(evening.title, evening.startsAt) : null,
    mode,
    editor: studioEditorOf(stageEditor, mode.editing, wide),
    music,
    stageDocument,
    cast,
    document: work,
    videos,
    final,
    frame: largeTextFrameOf(video.hero, large.videoShown),
    large,
    startHall,
    edits,
    studio,
    playback,
    practice,
    video,
    steps,
  };
};
