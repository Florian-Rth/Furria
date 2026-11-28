import type { StudioDocumentEdit } from '@furria/studio/studio-document-edit';
import type { Studio, VideoAlignment } from '@furria/studio/studio-schemas';
import type { VideoSplitInput } from '@furria/studio/studio-videos';
import type { ActStudioEdits } from '@furria/studio/use-act-studio-edits';
import type { ActStudioMode } from '@furria/studio/use-act-studio-mode';
import type { Practice } from '@furria/studio/use-practice';
import type { PracticeVideo } from '@furria/studio/use-practice-video';
import type { StudioPlayback } from '@furria/studio/use-studio-playback';
import type { KkGroupTone } from '@furria/ui/group-tone';

export interface StudioVideoActions {
  align: (videoId: number) => Promise<VideoAlignment>;
  aligning: (videoId: number) => boolean;
  remove: (videoId: number) => void;
  split: (input: VideoSplitInput) => void;
}

export interface StudioWorkScreen {
  tone: KkGroupTone | null;
  studio: Studio;
  document: StudioDocumentEdit;
  mode: ActStudioMode;
  edits: ActStudioEdits;
  playback: StudioPlayback;
  practice: Practice;
  video: PracticeVideo;
  videos: StudioVideoActions;
}
