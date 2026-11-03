import type { Setup, SetupKey, SetupState } from '@furria/studio/studio-setup';
import type { StudioFileInput } from '@furria/studio/studio-uploads';
import type { KkLaneGlyphName } from '@furria/ui/KkLaneGlyph';

export interface StudioSetupRow {
  key: SetupKey;
  number: number;
  total: number;
  state: SetupState;
  ready: boolean;
  stateText: string;
  glyph: KkLaneGlyphName;
  title: string;
  hint: string;
  fact: string;
  actionText: string;
  act: () => void;
}

export interface StudioSetup {
  setup: Setup;
  shown: boolean;
  rows: StudioSetupRow[];
  progressText: string;
  progressLabel: string;
  songs: StudioFileInput;
  videos: StudioFileInput;
  rowOf: (key: SetupKey) => StudioSetupRow | null;
}
