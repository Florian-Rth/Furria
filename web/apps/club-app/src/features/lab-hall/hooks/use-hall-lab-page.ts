import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { UseQueryResult } from '@tanstack/react-query';
import { useActStudioQuery } from '@/features/acts/api';
import type { ActStudioResponse, StudioTraining } from '@/features/acts/schemas';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import { parsePositiveId } from '@/lib/positive-id';
import { HALL_FALLBACK_TITLE } from '../hall-copy';
import { hallTrainingOf } from '../hall-scene';
import type { HallSearch } from '../schemas';

export interface HallLabPage {
  actId: number | null;
  query: UseQueryResult<ActStudioResponse, Error>;
  title: string;
  origin: KkScreenOrigin;
  training: StudioTraining | null;
}

export const useHallLabPage = (rawActId: string, search: HallSearch): HallLabPage => {
  const actId = parsePositiveId(rawActId);
  const query = useActStudioQuery(actId);

  return {
    actId,
    query,
    title: query.data?.act.name ?? HALL_FALLBACK_TITLE,
    origin: LAB_ORIGIN,
    training: hallTrainingOf(query.data?.studio?.trainings ?? [], search.training),
  };
};
