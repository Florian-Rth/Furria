import { groupActsPathOf } from '@/features/acts/acts-origin';
import { useGroupActsQuery } from '@/features/acts/api';
import { toHubActsMeta } from '../group-hub-labels';
import { toHubActsErrorMessage } from '../group-hub-messages';
import type { HubActs } from '../hub-acts';
import { hubActsOf } from '../hub-acts';

export interface HubActsView {
  acts: HubActs | null;
  meta: string | undefined;
  isLoading: boolean;
  errorMessage: string | null;
  manageTo: string;
  retry: () => void;
}

export const useHubActs = (groupId: number): HubActsView => {
  const query = useGroupActsQuery(groupId);
  const acts = query.data === undefined ? null : hubActsOf(query.data);

  return {
    acts,
    meta: acts === null ? undefined : toHubActsMeta(acts.current.length),
    isLoading: acts === null && query.error === null,
    errorMessage: acts === null ? toHubActsErrorMessage(query.error) : null,
    manageTo: groupActsPathOf(groupId),
    retry: () => {
      void query.refetch();
    },
  };
};
