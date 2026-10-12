import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
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

export interface DeclineMembershipApplicationInput {
  membershipApplicationId: number;
  applicantName: string;
}

export interface AdmitMembershipApplicationInput {
  membershipApplicationId: number;
  applicantName: string;
  request: AdmissionRequest;
}

export const useMembershipApplicationsQuery = (): UseQueryResult<
  MembershipApplicationsResponse,
  Error
> =>
  useQuery({
    queryKey: queryKeys.membershipApplications,
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
    queryKey: queryKeys.membershipApplication(membershipApplicationId),
    queryFn: load,
  });
};

export const useForgetMembershipApplication = (): ((membershipApplicationId: number) => void) => {
  const queryClient = useQueryClient();

  return (membershipApplicationId) => {
    queryClient.removeQueries({
      queryKey: queryKeys.membershipApplication(membershipApplicationId),
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
    changes: ['membershipApplication'],
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
    changes: ['membershipApplication', 'membership', 'person', 'account'],
    notice: {
      success: (input, admission) => toAdmittedMessage(input.applicantName, admission.invitation),
    },
  });
