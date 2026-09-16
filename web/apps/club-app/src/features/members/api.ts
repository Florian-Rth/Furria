import type { UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { requestMember, requestMembers } from './requests';
import type { MemberDetails, MembersResponse } from './schemas';

export const MEMBERS_QUERY_KEY = ['members'] as const;

export const memberQueryKey = (personId: number | null): readonly [string, number | null] => [
  'members',
  personId,
];

export const useMembersQuery = (): UseQueryResult<MembersResponse, Error> =>
  useQuery({
    queryKey: MEMBERS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestMembers),
  });

export const useMemberQuery = (personId: number | null): UseQueryResult<MemberDetails, Error> => {
  const load =
    personId === null
      ? skipToken
      : (): Promise<MemberDetails> =>
          withFreshAccessToken((accessToken) => requestMember(personId, accessToken));

  return useQuery({ queryKey: memberQueryKey(personId), queryFn: load });
};
