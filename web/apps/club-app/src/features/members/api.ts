import type { UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { requestMember, requestMembers } from './requests';
import type { MemberDetails, MembersResponse } from './schemas';

export const useMembersQuery = (): UseQueryResult<MembersResponse, Error> =>
  useQuery({
    queryKey: queryKeys.members,
    queryFn: () => withFreshAccessToken(requestMembers),
  });

export const useMemberQuery = (personId: number | null): UseQueryResult<MemberDetails, Error> => {
  const load =
    personId === null
      ? skipToken
      : (): Promise<MemberDetails> =>
          withFreshAccessToken((accessToken) => requestMember(personId, accessToken));

  return useQuery({ queryKey: queryKeys.member(personId), queryFn: load });
};
