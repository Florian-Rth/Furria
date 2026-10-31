import type { HubActCard } from '@/features/act-card/hub-acts';
import { hubActCardOf, ownHubActsOf } from '@/features/act-card/hub-acts';
import { toHistoryLinkMeta } from '@/features/acts/acts-copy';
import { groupActsPathOf } from '@/features/acts/acts-origin';
import { useGroupActsQuery, useMyActsQuery } from '@/features/acts/api';
import type { GroupAct } from '@/features/acts/schemas';
import { useMeQuery } from '@/features/session/api';
import { toHubActsErrorMessage } from '../group-hub-messages';
import { hubActsOf } from '../hub-acts';

export interface HubActsView {
  cards: HubActCard[];
  others: GroupAct[];
  historyMeta: string | undefined;
  loaded: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  historyTo: string;
  viewerId: number | null;
  retry: () => void;
}

const NO_CARDS: HubActCard[] = [];
const NO_ACTS: GroupAct[] = [];

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
    historyMeta:
      acts === null ? undefined : toHistoryLinkMeta(acts.recorded, acts.firstSessionYear),
    loaded,
    isLoading: !loaded && query.error === null,
    errorMessage: acts === null ? toHubActsErrorMessage(query.error) : null,
    historyTo: groupActsPathOf(groupId),
    viewerId: me.data?.person?.id ?? null,
    retry: () => {
      void query.refetch();
    },
  };
};
