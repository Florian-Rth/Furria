import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { requestMembers } from './requests';
import type { MembersResponse } from './schemas';

export const MEMBERS_QUERY_KEY = ['members'] as const;

export const useMembersQuery = (): UseQueryResult<MembersResponse, Error> =>
  useQuery({
    queryKey: MEMBERS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestMembers),
  });
