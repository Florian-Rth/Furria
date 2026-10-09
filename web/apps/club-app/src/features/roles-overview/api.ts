import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { requestRolesOverview } from './requests';
import type { RolesOverviewResponse } from './schemas';

export const useRolesOverviewQuery = (): UseQueryResult<RolesOverviewResponse, Error> =>
  useQuery({
    queryKey: queryKeys.rolesOverview,
    queryFn: () => withFreshAccessToken(requestRolesOverview),
  });
