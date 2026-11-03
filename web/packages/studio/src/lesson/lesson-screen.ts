import type { Studio } from '@furria/studio/studio-schemas';
import type { Practice } from '@furria/studio/use-practice';
import type { PracticeVideo } from '@furria/studio/use-practice-video';
import type { StudioPlayback } from '@furria/studio/use-studio-playback';

export interface LessonEditSwitch {
  canEdit: boolean;
  editing: boolean;
  toggle: () => void;
}

export interface LessonScreen {
  studio: Studio;
  playback: StudioPlayback;
  practice: Practice;
  video: PracticeVideo;
  mode: LessonEditSwitch;
  startHall: (() => void) | null;
}
