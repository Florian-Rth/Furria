import { canPractise, musicSegmentsOf } from '@furria/studio/music-timeline';
import { playerKeyActionsOf } from '@furria/studio/practice-key-actions';
import type { StudioTool } from '@furria/studio/studio-copy';
import { workedPathsOf } from '@furria/studio/studio-edits';
import { largeTextFrameOf } from '@furria/studio/studio-layout';
import { studioEditorOf } from '@furria/studio/studio-mode';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { useActStudioEdits, useKeptPosition } from '@furria/studio/use-act-studio-edits';
import { useActStudioMode } from '@furria/studio/use-act-studio-mode';
import { usePractice } from '@furria/studio/use-practice';
import { usePracticeMemory } from '@furria/studio/use-practice-memory';
import { usePracticeSteps } from '@furria/studio/use-practice-steps';
import { usePracticeVideo } from '@furria/studio/use-practice-video';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import { useStudioLargeText } from '@furria/studio/use-studio-large-text';
import type { StudioPlayback } from '@furria/studio/use-studio-playback';
import { useStudioPlayback } from '@furria/studio/use-studio-playback';
import { useKkLaneWide } from '@furria/ui/KkLaneWide';
import { useAudioPeaks } from '@/features/acts/api';
import type { ActStudio, StudioEvening } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { useLargeText } from '@/lib/use-large-text';
import { actUploadPortOf } from '../act-upload-port';
import type { VideoMutations } from '../api';
import { useSongMutations, useVideoMutations } from '../api';
import { eveningStudioOf } from '../studio-evening';
import { useStudioDeveloping } from './use-studio-developing';
import { useStudioDocument } from './use-studio-document';
import { useStudioFinal } from './use-studio-final';
import { useStudioMusicRoute } from './use-studio-music-route';
import { useVideoAutoAlign } from './use-video-auto-align';
import { useVisitHistory } from './use-visit-history';

export interface StudioEveningContext {
  evening: StudioEvening | null;
  startEditing: boolean;
  startHall: (() => void) | null;
  startTool?: StudioTool;
  stageEditor?: boolean;
}

const aligningOf =
  ({ align, autoAlign }: VideoMutations) =>
  (videoId: number): boolean =>
    [align, autoAlign].some((mutation) => mutation.isPending && mutation.variables === videoId);

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
  const { studio, final, add } = useStudioFinal(
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
  const uploads = {
    songs: actUploadPortOf(actId, music.add.mutateAsync),
    videos: actUploadPortOf(actId, videos.add.mutateAsync),
    final: actUploadPortOf(actId, add),
  };
  const history = useVisitHistory(actId, studio);
  const openMusic = useStudioMusicRoute(actId);

  return {
    evening,
    mode,
    editor: studioEditorOf(stageEditor, mode.editing, wide),
    songs: {
      remove: music.remove.mutate,
    },
    stageDocument,
    cast,
    document: work,
    videos: {
      align: videos.align.mutateAsync,
      aligning: aligningOf(videos),
      remove: videos.remove.mutate,
    },
    uploads,
    history,
    openMusic,
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
