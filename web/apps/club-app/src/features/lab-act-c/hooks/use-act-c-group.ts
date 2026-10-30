import { useGroupActsQuery, useMyActsQuery } from '@/features/acts/api';
import { useGroupHubQuery } from '@/features/group-hub/api';
import type { GroupHub } from '@/features/group-hub/schemas';
import { useMeQuery } from '@/features/session/api';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import type { HubActCard, HubActs } from '../hub-acts';
import { hubActCardOf, hubActsOf } from '../hub-acts';

export interface ActCGroupView {
  hub: GroupHub;
  cards: HubActCard[];
  others: HubActs['others'];
  viewerId: number | null;
}

export type ActCGroupState =
  | { kind: 'loading' }
  | { kind: 'missing' }
  | { kind: 'denied' }
  | { kind: 'ready'; view: ActCGroupView };

export interface ActCGroup {
  title: string;
  state: ActCGroupState;
}

const FALLBACK_TITLE = 'Gruppe';

export const useActCGroup = (groupId: number | null): ActCGroup => {
  const hub = useGroupHubQuery(groupId);
  const mine = useMyActsQuery();
  const groupActs = useGroupActsQuery(groupId ?? 0);
  const me = useMeQuery();
  const title = hub.data?.name ?? FALLBACK_TITLE;

  if (groupId === null || isNotFoundError(hub.error)) {
    return { title, state: { kind: 'missing' } };
  }
  if (isForbiddenError(hub.error)) {
    return { title, state: { kind: 'denied' } };
  }
  if (hub.data === undefined || mine.data === undefined || me.isPending) {
    return { title, state: { kind: 'loading' } };
  }

  const acts = hubActsOf(
    mine.data.acts,
    groupActs.data?.acts ?? [],
    groupId,
    groupActs.data?.relevantSessionYear ?? null,
  );

  return {
    title,
    state: {
      kind: 'ready',
      view: {
        hub: hub.data,
        cards: acts.mine.map(hubActCardOf),
        others: acts.others,
        viewerId: me.data?.person?.id ?? null,
      },
    },
  };
};
