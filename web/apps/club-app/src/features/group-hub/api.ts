import type { UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { requestMyGroup, requestMyGroups } from './requests';
import type { HubDetails, MyGroupsResponse } from './schemas';

export const MY_GROUPS_QUERY_KEY = ['my-groups'] as const;

export const myGroupQueryKey = (groupId: number | null): readonly [string, number | null] => [
  'my-groups',
  groupId,
];

export const useMyGroupsQuery = (): UseQueryResult<MyGroupsResponse, Error> =>
  useQuery({
    queryKey: MY_GROUPS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestMyGroups),
  });

export const useMyGroupQuery = (groupId: number | null): UseQueryResult<HubDetails, Error> => {
  const load =
    groupId === null
      ? skipToken
      : (): Promise<HubDetails> =>
          withFreshAccessToken((accessToken) => requestMyGroup(groupId, accessToken));

  return useQuery({ queryKey: myGroupQueryKey(groupId), queryFn: load });
};
