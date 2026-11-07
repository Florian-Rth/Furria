import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { requestManageHub } from './requests';
import type { ManageHub } from './schemas';

export const useManageHubQuery = (): UseQueryResult<ManageHub, Error> =>
  useQuery({
    queryKey: queryKeys.manageHub,
    queryFn: () => withFreshAccessToken(requestManageHub),
  });
