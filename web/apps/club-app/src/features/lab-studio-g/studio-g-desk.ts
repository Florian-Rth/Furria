import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import type { StudioGEdits } from './hooks/use-studio-g-edits';
import type { StudioGSelectionState } from './hooks/use-studio-g-selection';

export interface StudioGDesk {
  actName: string;
  studio: Studio;
  playback: StudioPlayback;
  edits: StudioGEdits;
  picked: StudioGSelectionState;
}
