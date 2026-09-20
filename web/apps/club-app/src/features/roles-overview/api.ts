import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { requestRolesOverview } from './requests';
import type { RolesOverviewResponse } from './schemas';

export const ROLES_OVERVIEW_QUERY_KEY = ['roles-overview'] as const;

export const useRolesOverviewQuery = (): UseQueryResult<RolesOverviewResponse, Error> =>
  useQuery({
    queryKey: ROLES_OVERVIEW_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestRolesOverview),
  });
