import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { UseQueryResult } from '@tanstack/react-query';
import { eveningCastOf } from '@/features/act-studio/studio-evening';
import { useActStudioQuery } from '@/features/acts/api';
import type { ActStudioResponse, StudioEvening } from '@/features/acts/schemas';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import type { CastPerson } from '@/features/running-order/schemas';
import { useMeQuery } from '@/features/session/api';
import { parsePositiveId } from '@/lib/positive-id';
import { LANE_FALLBACK_TITLE } from '../lane-copy';
import type { LaneSearch } from '../schemas';

export interface LanePage {
  actId: number | null;
  query: UseQueryResult<ActStudioResponse, Error>;
  title: string;
  origin: KkScreenOrigin;
  viewerId: number | null;
  canEdit: boolean;
  evening: StudioEvening | null;
  cast: readonly CastPerson[];
}

export const useLanePage = (
  rawActId: string,
  search: LaneSearch,
  origin: KkScreenOrigin = LAB_ORIGIN,
): LanePage => {
  const actId = parsePositiveId(rawActId);
  const query = useActStudioQuery(actId);
  const me = useMeQuery();
  const act = query.data?.act ?? null;
  const evening =
    query.data?.studio?.evenings.find((candidate) => candidate.eventId === search.evening) ?? null;

  return {
    actId,
    query,
    title: act?.name ?? LANE_FALLBACK_TITLE,
    origin,
    viewerId: me.data?.person?.id ?? null,
    canEdit: query.data?.viewer.canEditStudio === true,
    evening,
    cast: eveningCastOf(act?.cast ?? [], evening?.appearance ?? null),
  };
};
