import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['membershipApplication'] },
    mutationFn: (input: DeclineMembershipApplicationInput) =>
      withFreshAccessToken((accessToken) =>
        requestMembershipApplicationDecline(input.membershipApplicationId, accessToken),
      ),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toDeclinedMessage(input.applicantName) });
    },
  });
};

export const useAdmitMembershipApplicationMutation = (): UseMutationResult<
  AdmissionResult,
  Error,
  AdmitMembershipApplicationInput
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['membershipApplication', 'membership', 'person', 'account'] },
    mutationFn: (input: AdmitMembershipApplicationInput) =>
      withFreshAccessToken((accessToken) =>
        requestMembershipApplicationAdmission(
          input.membershipApplicationId,
          input.request,
          accessToken,
        ),
      ),
    onSuccess: (admission, input) => {
      raiseNotice({
        tone: 'success',
        message: toAdmittedMessage(input.applicantName, admission.invitation),
      });
    },
  });
};
