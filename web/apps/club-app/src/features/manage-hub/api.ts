import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { requestManageHub } from './requests';
import type { ManageHub } from './schemas';

export const MANAGE_HUB_QUERY_KEY = ['manage-hub'] as const;

export const useManageHubQuery = (): UseQueryResult<ManageHub, Error> =>
  useQuery({
    queryKey: MANAGE_HUB_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestManageHub),
  });
