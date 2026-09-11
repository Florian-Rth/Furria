import type { UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { requestGroup, requestGroups } from './requests';
import type { GroupDetails, GroupsResponse } from './schemas';

export const GROUPS_QUERY_KEY = ['groups'] as const;

export const groupQueryKey = (groupId: number | null): readonly [string, number | null] => [
  'groups',
  groupId,
];

export const useGroupsQuery = (): UseQueryResult<GroupsResponse, Error> =>
  useQuery({
    queryKey: GROUPS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestGroups),
  });

export const useGroupQuery = (groupId: number | null): UseQueryResult<GroupDetails, Error> => {
  const load =
    groupId === null
      ? skipToken
      : (): Promise<GroupDetails> =>
          withFreshAccessToken((accessToken) => requestGroup(groupId, accessToken));

  return useQuery({ queryKey: groupQueryKey(groupId), queryFn: load });
};
