import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AltchaProof } from '@/lib/altcha/altcha-proof';
import type { AltchaProofSource } from '@/lib/altcha/proof-source';
import { submitWithFreshProof, usePreparedAltchaProof } from '@/lib/altcha/proof-source';
import { apiFetch } from '@/lib/api/api-fetch';
import { ApiError } from '@/lib/api/errors';
import { buildMembershipApplicationPayload } from './apply-payload';
import type {
  ConfirmationOutcome,
  MembershipApplicationForm,
  MembershipApplicationResponse,
} from './schemas';
import {
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

const altchaProofSource: AltchaProofSource = {
  challengePath: '/api/membership-applications/challenge',
  queryKey: membershipApplicationKeys.altchaProof,
};

export const usePreparedMembershipAltchaProof = (isNeeded: boolean): void => {
  usePreparedAltchaProof(altchaProofSource, isNeeded);
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

const submitMembershipApplication = (
  queryClient: QueryClient,
  values: MembershipApplicationForm,
): Promise<MembershipApplicationResponse> =>
  submitWithFreshProof(queryClient, altchaProofSource, (proof) =>
    postMembershipApplication(values, proof),
  );

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
