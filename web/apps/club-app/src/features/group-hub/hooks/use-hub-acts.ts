import type { HubActCard } from '@/features/act-card/hub-acts';
import { hubActCardOf, ownHubActsOf } from '@/features/act-card/hub-acts';
import { groupActsPathOf } from '@/features/acts/acts-origin';
import { useGroupActsQuery, useMyActsQuery } from '@/features/acts/api';
import type { GroupAct } from '@/features/acts/schemas';
import { useMeQuery } from '@/features/session/api';
import { toHubActsMeta } from '../group-hub-labels';
import { toHubActsErrorMessage } from '../group-hub-messages';
import type { HubActSession } from '../hub-acts';
import { hubActsOf } from '../hub-acts';

export interface HubActsView {
  cards: HubActCard[];
  others: GroupAct[];
  earlier: HubActSession[];
  loaded: boolean;
  meta: string | undefined;
  isLoading: boolean;
  errorMessage: string | null;
  manageTo: string;
  viewerId: number | null;
  retry: () => void;
}

const NO_CARDS: HubActCard[] = [];
const NO_ACTS: GroupAct[] = [];
const NO_SESSIONS: HubActSession[] = [];

export const useHubActs = (groupId: number): HubActsView => {
  const query = useGroupActsQuery(groupId);
  const mine = useMyActsQuery();
  const me = useMeQuery();
  const acts = query.data === undefined ? null : hubActsOf(query.data);
  const own =
    query.data === undefined || mine.isPending
      ? null
      : ownHubActsOf(
          mine.data?.acts ?? [],
          acts?.current ?? [],
          groupId,
          query.data.relevantSessionYear,
        );
  const loaded = acts !== null && own !== null;

  return {
    cards: own?.mine.map(hubActCardOf) ?? NO_CARDS,
    others: own?.others ?? NO_ACTS,
    earlier: acts?.earlier ?? NO_SESSIONS,
    loaded,
    meta: acts === null ? undefined : toHubActsMeta(acts.current.length),
    isLoading: !loaded && query.error === null,
    errorMessage: acts === null ? toHubActsErrorMessage(query.error) : null,
    manageTo: groupActsPathOf(groupId),
    viewerId: me.data?.person?.id ?? null,
    retry: () => {
      void query.refetch();
    },
  };
};
