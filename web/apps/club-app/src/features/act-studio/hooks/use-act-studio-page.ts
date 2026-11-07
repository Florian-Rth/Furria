import type { KkGroupTone } from '@furria/ui/group-tone';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { UseQueryResult } from '@tanstack/react-query';
import { ACT_FALLBACK_TITLE } from '@/features/acts/act-page-copy';
import { ACT_EDIT_PATH } from '@/features/acts/act-screens';
import { originTextSearchOf } from '@/features/acts/acts-origin';
import { useActStudioQuery } from '@/features/acts/api';
import type { ActScreenSearch, ActStudioResponse } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { useMeQuery } from '@/features/session/api';
import { parsePositiveId } from '@/lib/positive-id';

const NO_CAST: readonly CastPerson[] = [];

export interface ActStudioPage {
  actId: number | null;
  query: UseQueryResult<ActStudioResponse, Error>;
  actName: string;
  origin: KkScreenOrigin;
  viewerId: number | null;
  canEdit: boolean;
  cast: readonly CastPerson[];
  tone: KkGroupTone | null;
  reload: () => void;
}

export const useActStudioPage = (rawActId: string, search: ActScreenSearch): ActStudioPage => {
  const actId = parsePositiveId(rawActId);
  const query = useActStudioQuery(actId);
  const me = useMeQuery();
  const act = query.data?.act ?? null;
  const actName = act?.name ?? ACT_FALLBACK_TITLE;

  return {
    actId,
    query,
    actName,
    origin: {
      label: actName,
      to: ACT_EDIT_PATH,
      params: { actId: rawActId },
      search: originTextSearchOf(search),
    },
    viewerId: me.data?.person?.id ?? null,
    canEdit: query.data?.viewer.canEditStudio === true,
    cast: act?.cast ?? NO_CAST,
    tone: act?.group?.tone ?? null,
    reload: () => {
      void query.refetch();
    },
  };
};
