import { useGroupActsQuery, useMyActsQuery } from '@/features/acts/api';
import type { GroupAct, MyAct } from '@/features/acts/schemas';
import { useGroupHubQuery } from '@/features/group-hub/api';
import type { GroupHub } from '@/features/group-hub/schemas';
import { useMeQuery } from '@/features/session/api';
import { parsePositiveId } from '@/lib/positive-id';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { groupActsOf } from '../pass-act';
import { GROUP_FALLBACK_TITLE, toGroupMeta } from '../pass-copy';

const UNKNOWN_GROUP = 0;

export type PassGroupPageStatus = 'loading' | 'ready' | 'notFound' | 'forbidden' | 'failed';

export interface PassGroupPage {
  status: PassGroupPageStatus;
  groupId: number | null;
  hub: GroupHub | undefined;
  cards: MyAct[];
  rows: GroupAct[];
  actsReady: boolean;
  viewerId: number | null;
  title: string;
  meta: string;
  retrying: boolean;
  retry: () => void;
}

const statusOf = (
  groupId: number | null,
  hub: GroupHub | undefined,
  error: Error | null,
): PassGroupPageStatus => {
  if (groupId === null || isNotFoundError(error)) {
    return 'notFound';
  }
  if (hub !== undefined) {
    return 'ready';
  }
  if (isForbiddenError(error)) {
    return 'forbidden';
  }

  return error === null ? 'loading' : 'failed';
};

export const usePassGroupPage = (rawGroupId: string): PassGroupPage => {
  const groupId = parsePositiveId(rawGroupId);
  const hub = useGroupHubQuery(groupId);
  const groupActs = useGroupActsQuery(groupId ?? UNKNOWN_GROUP);
  const mine = useMyActsQuery();
  const me = useMeQuery();
  const acts =
    groupId === null
      ? { cards: [], rows: [] }
      : groupActsOf(groupActs.data?.acts ?? [], mine.data?.acts ?? [], groupId);

  return {
    status: statusOf(groupId, hub.data, hub.error),
    groupId,
    hub: hub.data,
    cards: acts.cards,
    rows: acts.rows,
    actsReady: groupActs.data !== undefined && mine.data !== undefined,
    viewerId: me.data?.person?.id ?? null,
    title: hub.data?.name ?? GROUP_FALLBACK_TITLE,
    meta: hub.data === undefined ? '' : toGroupMeta(hub.data),
    retrying: hub.isFetching || groupActs.isFetching || mine.isFetching,
    retry: () => {
      void hub.refetch();
      void groupActs.refetch();
      void mine.refetch();
    },
  };
};
