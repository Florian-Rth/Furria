import type { ActStudioFrame } from '@furria/studio/studio-layout';
import type { StudioEditor } from '@furria/studio/studio-mode';
import type { StudioMusicTool } from '@furria/studio/studio-schemas';
import type { SpotPerson } from '@furria/studio/studio-spots';
import type { StudioUploadPort } from '@furria/studio/studio-uploads';
import type { StudioWorkScreen } from '@furria/studio/studio-work-screen';
import type { PracticeSteps } from '@furria/studio/use-practice-steps';
import type { StudioLargeText } from '@furria/studio/use-studio-large-text';
import type { VisitHistory } from '@furria/studio/visit-history';

export interface StudioSongSplit {
  songId: number;
  atSeconds: number;
}

export interface StudioSongActions {
  remove: (songId: number) => Promise<void>;
  split: (split: StudioSongSplit) => Promise<void>;
  splitting: boolean;
}

export interface StudioScreenUploads {
  songs: StudioUploadPort;
  videos: StudioUploadPort;
}

export interface StudioScreen extends StudioWorkScreen {
  songs: StudioSongActions;
  uploads: StudioScreenUploads;
  history: VisitHistory;
  openMusic: (tool: StudioMusicTool) => void;
  openStepSetup: () => void;
  cast: readonly SpotPerson[];
  editor: StudioEditor | null;
  frame: ActStudioFrame;
  large: StudioLargeText;
  steps: PracticeSteps;
}
