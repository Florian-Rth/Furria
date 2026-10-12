import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { requestGroups } from './requests';
import type { GroupsResponse } from './schemas';

export const useGroupsQuery = (enabled = true): UseQueryResult<GroupsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.groups,
    queryFn: () => withFreshAccessToken(requestGroups),
    enabled,
  });
