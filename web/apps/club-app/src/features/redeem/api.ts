import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery } from '@tanstack/react-query';
import { signInWithIssuedTokens } from '@/lib/api/session/session-store';
import { requestInvitationLookup, requestInvitationRedeem } from './requests';
import type { InvitationLookup, RedeemForm } from './schemas';

const invitationLookupQueryKey = (
  token: string | null,
): readonly [string, string, string | null] => ['auth', 'invitation-lookup', token];

export const useInvitationLookupQuery = (
  token: string | null,
  isSignedIn: boolean,
): UseQueryResult<InvitationLookup, Error> => {
  const lookUp =
    token === null || isSignedIn
      ? skipToken
      : (): Promise<InvitationLookup> => requestInvitationLookup(token);

  return useQuery({
    queryKey: invitationLookupQueryKey(token),
    queryFn: lookUp,
    staleTime: Number.POSITIVE_INFINITY,
  });
};

export interface RedeemRequest extends RedeemForm {
  token: string;
}

export const useRedeemInvitationMutation = (): UseMutationResult<void, Error, RedeemRequest> =>
  useMutation({
    mutationFn: async (request: RedeemRequest) => {
      await signInWithIssuedTokens(await requestInvitationRedeem(request.token, request.password));
    },
  });
