import { useRunningVenuesQuery } from '@/features/calendar';
import { toUnavailableVenueIds } from '../rhythm-labels';
import type { TrainingSlot } from '../schemas';
import { MAX_TRAINING_SLOTS } from '../schemas';

interface RhythmSlotsInput {
  slots: readonly TrainingSlot[];
}

export interface RhythmSlotsInfo {
  isFull: boolean;
  unavailableVenueIds: ReadonlySet<number>;
}

export const useRhythmSlotsInfo = ({ slots }: RhythmSlotsInput): RhythmSlotsInfo => {
  const venues = useRunningVenuesQuery();

  return {
    isFull: slots.length >= MAX_TRAINING_SLOTS,
    unavailableVenueIds: toUnavailableVenueIds(slots, venues.data?.venues ?? null),
  };
};
