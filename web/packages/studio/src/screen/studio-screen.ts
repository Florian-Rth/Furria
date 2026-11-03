import type { ActStudioFrame } from '@furria/studio/studio-layout';
import type { StudioEditor } from '@furria/studio/studio-mode';
import type {
  FinalTrackMatches,
  StudioFinalTrack,
  StudioMusicTool,
} from '@furria/studio/studio-schemas';
import type { SpotPerson } from '@furria/studio/studio-spots';
import type { StudioUploadPort } from '@furria/studio/studio-uploads';
import type { StudioFinalView, StudioWorkScreen } from '@furria/studio/studio-work-screen';
import type { PracticeSteps } from '@furria/studio/use-practice-steps';
import type { StudioLargeText } from '@furria/studio/use-studio-large-text';
import type { VisitHistory } from '@furria/studio/visit-history';

export interface StudioSongActions {
  remove: (songId: number) => void;
}

export interface StudioFinal extends StudioFinalView {
  adopted: StudioFinalTrack | null;
  togglePreview: (position: number) => void;
  match: (finalTrackId: number) => Promise<FinalTrackMatches>;
  matching: boolean;
  adopt: (finalTrackId: number) => void;
  adopting: boolean;
  remove: (finalTrackId: number) => void;
}

export interface StudioScreenUploads {
  songs: StudioUploadPort;
  videos: StudioUploadPort;
  final: StudioUploadPort;
}

export interface StudioScreen extends StudioWorkScreen {
  songs: StudioSongActions;
  final: StudioFinal;
  uploads: StudioScreenUploads;
  history: VisitHistory;
  openMusic: (tool: StudioMusicTool) => void;
  cast: readonly SpotPerson[];
  editor: StudioEditor | null;
  frame: ActStudioFrame;
  large: StudioLargeText;
  startHall: (() => void) | null;
  steps: PracticeSteps;
}
