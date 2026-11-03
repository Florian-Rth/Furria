import type { MusicSegment } from '@furria/studio/music-timeline';
import type { StudioDocumentEdit } from '@furria/studio/studio-document-edit';
import type { FinalPlacements } from '@furria/studio/studio-final';
import type { Studio, StudioFinalTrack, VideoAlignment } from '@furria/studio/studio-schemas';
import type { ActStudioEdits } from '@furria/studio/use-act-studio-edits';
import type { ActStudioMode } from '@furria/studio/use-act-studio-mode';
import type { Practice } from '@furria/studio/use-practice';
import type { PracticeVideo } from '@furria/studio/use-practice-video';
import type { StudioPlayback } from '@furria/studio/use-studio-playback';

export interface StudioWorkEvening {
  eventId: number;
  title: string;
  startsAt: string;
}

export interface StudioFinalView {
  pending: StudioFinalTrack | null;
  previewing: boolean;
  placements: FinalPlacements;
  mix: readonly MusicSegment[];
}

export interface StudioVideoActions {
  align: (videoId: number) => Promise<VideoAlignment>;
  aligning: (videoId: number) => boolean;
  remove: (videoId: number) => void;
}

export interface StudioWorkScreen {
  evening: StudioWorkEvening | null;
  studio: Studio;
  document: StudioDocumentEdit;
  stageDocument: StudioDocumentEdit;
  final: StudioFinalView;
  mode: ActStudioMode;
  edits: ActStudioEdits;
  playback: StudioPlayback;
  practice: Practice;
  video: PracticeVideo;
  videos: StudioVideoActions;
}
