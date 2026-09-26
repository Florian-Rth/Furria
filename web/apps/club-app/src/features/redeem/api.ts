import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signInWithIssuedTokens } from '@/lib/api/session/session-store';
import type { InvitationCredential } from './invitation-credential';
import { toCredentialKey } from './invitation-credential';
import type { RedemptionRequest } from './requests';
import { requestInvitationLookup, requestInvitationRedeem } from './requests';
import type { InvitationLookup, Redemption } from './schemas';

const invitationLookupQueryKey = (
  credential: InvitationCredential | null,
): readonly [string, string, string | null] => [
  'auth',
  'invitation-lookup',
  toCredentialKey(credential),
];

export const useInvitationLookupQuery = (
  credential: InvitationCredential | null,
  isSignedIn: boolean,
): UseQueryResult<InvitationLookup, Error> => {
  const lookUp =
    credential === null || isSignedIn
      ? skipToken
      : (): Promise<InvitationLookup> => requestInvitationLookup(credential);

  return useQuery({
    queryKey: invitationLookupQueryKey(credential),
    queryFn: lookUp,
    staleTime: Number.POSITIVE_INFINITY,
  });
};

const rememberLookup = (
  queryClient: QueryClient,
  credential: InvitationCredential,
  lookup: InvitationLookup,
): void => {
  queryClient.setQueryData(invitationLookupQueryKey(credential), lookup);
};

export const useCodeLookupMutation = (): UseMutationResult<
  InvitationLookup,
  Error,
  InvitationCredential
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestInvitationLookup,
    onSuccess: (lookup, credential) => {
      rememberLookup(queryClient, credential, lookup);
    },
  });
};

export const useRedeemInvitationMutation = (): UseMutationResult<
  Redemption,
  Error,
  RedemptionRequest
> =>
  useMutation({
    mutationFn: async (request: RedemptionRequest) => {
      const redemption = await requestInvitationRedeem(request);
      if (redemption.outcome === 'redeemed') {
        await signInWithIssuedTokens(redemption.session);
      }

      return redemption;
    },
  });
