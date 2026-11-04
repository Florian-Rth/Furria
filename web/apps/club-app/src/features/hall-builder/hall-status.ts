import type { KkPlanStatusChipTone } from '@furria/ui/KkPlanStatusStrip';
import type { HallSaveState } from './hooks/use-hall-autosave';

const SAVE_TONES: Record<HallSaveState, KkPlanStatusChipTone> = {
  saved: 'done',
  saving: 'neutral',
  pending: 'neutral',
  failed: 'conflict',
};

export const saveToneOf = (state: HallSaveState): KkPlanStatusChipTone => SAVE_TONES[state];
