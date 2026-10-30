import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { UseQueryResult } from '@tanstack/react-query';
import { eveningCastOf } from '@/features/act-studio/studio-evening';
import { useActStudioQuery } from '@/features/acts/api';
import type { ActStudioResponse, StudioEvening } from '@/features/acts/schemas';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import type { CastPerson } from '@/features/running-order/schemas';
import { useMeQuery } from '@/features/session/api';
import { parsePositiveId } from '@/lib/positive-id';
import { EIGHTS_FALLBACK_TITLE } from '../eights-copy';

export interface EightsPage {
  actId: number | null;
  query: UseQueryResult<ActStudioResponse, Error>;
  title: string;
  origin: KkScreenOrigin;
  viewerId: number | null;
  canEdit: boolean;
  evening: StudioEvening | null;
  cast: readonly CastPerson[];
}

const NO_CAST: readonly CastPerson[] = [];

export const useEightsPage = (rawActId: string, eveningId: number | undefined): EightsPage => {
  const actId = parsePositiveId(rawActId);
  const query = useActStudioQuery(actId);
  const me = useMeQuery();
  const data = query.data;
  const evening = data?.studio?.evenings.find((entry) => entry.eventId === eveningId) ?? null;

  return {
    actId,
    query,
    title: data?.act.name ?? EIGHTS_FALLBACK_TITLE,
    origin: LAB_ORIGIN,
    viewerId: me.data?.person?.id ?? null,
    canEdit: data?.viewer.canEditStudio === true,
    evening,
    cast: eveningCastOf(data?.act.cast ?? NO_CAST, evening?.appearance ?? null),
  };
};
