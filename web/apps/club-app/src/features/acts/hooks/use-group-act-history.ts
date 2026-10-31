import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCloseOnEscape } from '@/features/events/hooks/use-close-on-escape';
import { useGroupHubQuery } from '@/features/group-hub/api';
import type { GroupHub } from '@/features/group-hub/schemas';
import { useActsQuery } from '@/features/running-order/api';
import { usePlansRunningOrder } from '@/features/running-order/hooks/use-plans-running-order';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { parsePositiveId } from '@/lib/positive-id';
import type { HistorySession } from '../act-history';
import { actHistoryOf } from '../act-history';
import { ACT_PAGE_PATH } from '../acts-origin';
import { useGroupActsQuery } from '../api';
import type { GroupActsResponse, GroupActsSearch } from '../schemas';
import { NEW_ACT } from '../schemas';

const NO_SESSIONS: HistorySession[] = [];
const NO_ACTS: readonly CatalogueAct[] = [];

export interface GroupActHistory {
  groupId: number | null;
  hub: UseQueryResult<GroupHub, Error>;
  query: UseQueryResult<GroupActsResponse, Error>;
  sessions: HistorySession[];
  paneActs: readonly CatalogueAct[];
  manages: boolean;
  isCreating: boolean;
  isSideOpen: boolean;
  isWide: boolean;
  openNew: () => void;
  close: () => void;
  created: (actId: number) => void;
  reload: () => void;
}

export const useGroupActHistory = (groupId: string, search: GroupActsSearch): GroupActHistory => {
  const id = parsePositiveId(groupId);
  const hub = useGroupHubQuery(id);
  const query = useGroupActsQuery(id);
  const plans = usePlansRunningOrder();
  const navigate = useNavigate();
  const isWide = useIsWideScreen();
  const manages = plans || hub.data?.viewerIsAdmin === true;
  const isCreating = manages && search.act === NEW_ACT;
  const paneActs = useActsQuery(null, isCreating);

  const setCreating = (creating: boolean): void => {
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, act: creating ? NEW_ACT : undefined }),
      replace: !creating,
      resetScroll: false,
    });
  };
  const close = (): void => {
    setCreating(false);
  };

  useCloseOnEscape(isWide && isCreating, close);

  return {
    groupId: id,
    hub,
    query,
    sessions: query.data === undefined ? NO_SESSIONS : actHistoryOf(query.data),
    paneActs: paneActs.data?.acts ?? NO_ACTS,
    manages,
    isCreating,
    isSideOpen: isWide && isCreating,
    isWide,
    openNew: () => {
      setCreating(true);
    },
    close,
    created: (actId) => {
      void navigate({
        to: ACT_PAGE_PATH,
        params: { actId: String(actId) },
        search: { from: 'groupActs', group: id ?? undefined },
        replace: true,
      });
    },
    reload: () => {
      void query.refetch();
    },
  };
};
