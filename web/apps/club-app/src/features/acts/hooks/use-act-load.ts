import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { UseQueryResult } from '@tanstack/react-query';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { useMeQuery } from '@/features/session/api';
import { parsePositiveId } from '@/lib/positive-id';
import { ACT_FALLBACK_TITLE } from '../act-page-copy';
import { actPageOriginOf, actPageReturnOf } from '../acts-origin';
import { useActStudioQuery } from '../api';
import type { ActScreenSearch, ActStudioResponse } from '../schemas';

export interface ActLoad {
  actId: number | null;
  query: UseQueryResult<ActStudioResponse, Error>;
  act: CatalogueAct | null;
  name: string;
  away: KkScreenOrigin;
  viewerId: number | null;
  canEditStudio: boolean;
  reload: () => void;
}

export const useActLoad = (rawActId: string, search: ActScreenSearch): ActLoad => {
  const actId = parsePositiveId(rawActId);
  const query = useActStudioQuery(actId);
  const me = useMeQuery();
  const act = query.data?.act ?? null;

  return {
    actId,
    query,
    act,
    name: act?.name ?? ACT_FALLBACK_TITLE,
    away: actPageOriginOf(actPageReturnOf(search, act), act),
    viewerId: me.data?.person?.id ?? null,
    canEditStudio: query.data?.viewer.canEditStudio === true,
    reload: () => {
      void query.refetch();
    },
  };
};
