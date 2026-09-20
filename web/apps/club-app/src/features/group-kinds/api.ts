import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { requestGroupKinds } from './requests';
import type { GroupKindsResponse } from './schemas';

export const GROUP_KINDS_QUERY_KEY = ['group-kinds'] as const;

export const useGroupKindsQuery = (): UseQueryResult<GroupKindsResponse, Error> =>
  useQuery({
    queryKey: GROUP_KINDS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestGroupKinds),
  });
