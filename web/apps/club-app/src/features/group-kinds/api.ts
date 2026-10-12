import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { requestGroupKinds } from './requests';
import type { GroupKindsResponse } from './schemas';

export const useGroupKindsQuery = (): UseQueryResult<GroupKindsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.groupKinds,
    queryFn: () => withFreshAccessToken(requestGroupKinds),
  });
