import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { requestGroups } from './requests';
import type { GroupsResponse } from './schemas';

export const GROUPS_QUERY_KEY = ['groups'] as const;

export const useGroupsQuery = (enabled = true): UseQueryResult<GroupsResponse, Error> =>
  useQuery({
    queryKey: GROUPS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestGroups),
    enabled,
  });
