import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import {
  queryOptions,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api-fetch';
import { ApiError } from '@/lib/api/errors';
import type { AltchaProof } from './altcha-proof';
import { isProofRefusal, proofFreshFor } from './altcha-proof';
import { solveAltchaChallenge } from './altcha-solver';
import { buildMembershipApplicationPayload } from './apply-payload';
import type {
  ConfirmationOutcome,
  MembershipApplicationForm,
  MembershipApplicationResponse,
} from './schemas';
import {
  AltchaChallengeSchema,
  MembershipApplicationConfirmationResponseSchema,
  MembershipApplicationResponseSchema,
} from './schemas';

const GONE_STATUS = 410;

export const membershipApplicationKeys = {
  altchaProof: ['membership-application', 'altcha-proof'] as const,
  confirmation: (
    token: string | null,
  ): readonly ['membership-application', 'confirmation', string | null] => [
    'membership-application',
    'confirmation',
    token,
  ],
};

const fetchAltchaProof = async ({ signal }: { signal: AbortSignal }): Promise<AltchaProof> => {
  const challenge = await apiFetch('/api/membership-applications/challenge', {
    schema: AltchaChallengeSchema,
  });

  return {
    payload: await solveAltchaChallenge(challenge, signal),
    expiresAt: challenge.parameters.expiresAt,
  };
};

const altchaProofQuery = queryOptions({
  queryKey: membershipApplicationKeys.altchaProof,
  queryFn: fetchAltchaProof,
  staleTime: (query) => proofFreshFor(query.state.data, query.state.dataUpdatedAt),
});

export const usePreparedAltchaProof = (isNeeded: boolean): void => {
  useQuery({ ...altchaProofQuery, enabled: isNeeded });
};

const postMembershipApplication = (
  values: MembershipApplicationForm,
  proof: AltchaProof,
): Promise<MembershipApplicationResponse> =>
  apiFetch('/api/membership-applications', {
    method: 'POST',
    body: buildMembershipApplicationPayload(values, proof.payload),
    schema: MembershipApplicationResponseSchema,
  });

const spendFreshProof = async (queryClient: QueryClient): Promise<AltchaProof> => {
  const proof = await queryClient.fetchQuery(altchaProofQuery);
  queryClient.removeQueries({ queryKey: altchaProofQuery.queryKey, exact: true });

  return proof;
};

const submitMembershipApplication = async (
  queryClient: QueryClient,
  values: MembershipApplicationForm,
): Promise<MembershipApplicationResponse> => {
  try {
    return await postMembershipApplication(values, await spendFreshProof(queryClient));
  } catch (error) {
    if (error instanceof Error && isProofRefusal(error)) {
      return postMembershipApplication(values, await spendFreshProof(queryClient));
    }
    throw error;
  }
};

export const useSubmitMembershipApplicationMutation = (): UseMutationResult<
  MembershipApplicationResponse,
  Error,
  MembershipApplicationForm
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: MembershipApplicationForm): Promise<MembershipApplicationResponse> =>
      submitMembershipApplication(queryClient, values),
  });
};

const confirmMembershipApplication = async (token: string): Promise<ConfirmationOutcome> => {
  try {
    const { outcome } = await apiFetch('/api/membership-applications/confirmation', {
      method: 'POST',
      body: { token },
      schema: MembershipApplicationConfirmationResponseSchema,
    });

    return outcome;
  } catch (error) {
    if (error instanceof ApiError && error.status === GONE_STATUS) {
      return 'expired';
    }
    throw error;
  }
};

export const useMembershipApplicationConfirmationQuery = (
  token: string | null,
): UseQueryResult<ConfirmationOutcome, Error> =>
  useQuery({
    queryKey: membershipApplicationKeys.confirmation(token),
    queryFn:
      token === null
        ? skipToken
        : (): Promise<ConfirmationOutcome> => confirmMembershipApplication(token),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
