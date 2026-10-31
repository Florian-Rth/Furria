import { useRunningVenuesQuery } from '@/features/calendar/api';
import type { UsualTrainingTime } from '../schemas';
import { MAX_USUAL_TRAINING_TIMES } from '../schemas';
import { toUnavailableVenueIds } from '../usual-training-time-labels';

interface UsualTrainingTimesInput {
  usualTimes: readonly UsualTrainingTime[];
}

export interface UsualTrainingTimesInfo {
  isFull: boolean;
  unavailableVenueIds: ReadonlySet<number>;
}

export const useUsualTrainingTimesInfo = ({
  usualTimes,
}: UsualTrainingTimesInput): UsualTrainingTimesInfo => {
  const venues = useRunningVenuesQuery();

  return {
    isFull: usualTimes.length >= MAX_USUAL_TRAINING_TIMES,
    unavailableVenueIds: toUnavailableVenueIds(usualTimes, venues.data?.venues ?? null),
  };
};
