import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { MANAGE_HUB_QUERY_KEY } from '@/features/manage-hub';
import { PERSONS_QUERY_KEY } from '@/features/manage-persons';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import type { AdmissionRequest } from './admission';
import { toAdmittedMessage } from './admission-labels';
import { toDeclinedMessage } from './manage-membership-applications-labels';
import {
  requestMembershipApplication,
  requestMembershipApplicationAdmission,
  requestMembershipApplicationDecline,
  requestMembershipApplications,
} from './requests';
import type {
  AdmissionResult,
  MembershipApplicationDetails,
  MembershipApplicationsResponse,
} from './schemas';

export const MEMBERSHIP_APPLICATIONS_QUERY_KEY = ['manage', 'membership-applications'] as const;

export const membershipApplicationQueryKey = (
  membershipApplicationId: number | null,
): readonly [string, string, number | null] => [
  'manage',
  'membership-application',
  membershipApplicationId,
];

export interface DeclineMembershipApplicationInput {
  membershipApplicationId: number;
  applicantName: string;
}

export interface AdmitMembershipApplicationInput {
  membershipApplicationId: number;
  applicantName: string;
  request: AdmissionRequest;
}

const UNDECIDED_SCOPE = [MEMBERSHIP_APPLICATIONS_QUERY_KEY, MANAGE_HUB_QUERY_KEY] as const;

export const useMembershipApplicationsQuery = (): UseQueryResult<
  MembershipApplicationsResponse,
  Error
> =>
  useQuery({
    queryKey: MEMBERSHIP_APPLICATIONS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestMembershipApplications),
  });

export const useMembershipApplicationQuery = (
  membershipApplicationId: number | null,
): UseQueryResult<MembershipApplicationDetails, Error> => {
  const load =
    membershipApplicationId === null
      ? skipToken
      : (): Promise<MembershipApplicationDetails> =>
          withFreshAccessToken((accessToken) =>
            requestMembershipApplication(membershipApplicationId, accessToken),
          );

  return useQuery({
    queryKey: membershipApplicationQueryKey(membershipApplicationId),
    queryFn: load,
  });
};

export const useForgetMembershipApplication = (): ((membershipApplicationId: number) => void) => {
  const queryClient = useQueryClient();

  return (membershipApplicationId) => {
    queryClient.removeQueries({
      queryKey: membershipApplicationQueryKey(membershipApplicationId),
      exact: true,
    });
  };
};

export const useDeclineMembershipApplicationMutation = (): UseMutationResult<
  void,
  Error,
  DeclineMembershipApplicationInput
> =>
  useApiMutation({
    request: (input: DeclineMembershipApplicationInput, accessToken) =>
      requestMembershipApplicationDecline(input.membershipApplicationId, accessToken),
    invalidates: UNDECIDED_SCOPE,
    notice: { success: (input) => toDeclinedMessage(input.applicantName) },
  });

export const useAdmitMembershipApplicationMutation = (): UseMutationResult<
  AdmissionResult,
  Error,
  AdmitMembershipApplicationInput
> =>
  useApiMutation({
    request: (input: AdmitMembershipApplicationInput, accessToken) =>
      requestMembershipApplicationAdmission(
        input.membershipApplicationId,
        input.request,
        accessToken,
      ),
    invalidates: [...UNDECIDED_SCOPE, PERSONS_QUERY_KEY],
    notice: {
      success: (input, admission) => toAdmittedMessage(input.applicantName, admission.invitation),
    },
  });
