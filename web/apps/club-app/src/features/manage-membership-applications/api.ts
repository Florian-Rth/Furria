import { useKkNotice } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MANAGE_HUB_QUERY_KEY } from '@/features/manage-hub';
import { PERSONS_QUERY_KEY } from '@/features/manage-persons';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { isNotFoundError } from '@/lib/query-error';
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
  ...MEMBERSHIP_APPLICATIONS_QUERY_KEY,
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

const refreshUndecided = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: MEMBERSHIP_APPLICATIONS_QUERY_KEY, exact: true });
  void queryClient.invalidateQueries({ queryKey: MANAGE_HUB_QUERY_KEY });
};

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
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (input: DeclineMembershipApplicationInput) =>
      withFreshAccessToken((accessToken) =>
        requestMembershipApplicationDecline(input.membershipApplicationId, accessToken),
      ),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toDeclinedMessage(input.applicantName) });
      refreshUndecided(queryClient);
    },
    onError: (error) => {
      if (isNotFoundError(error)) {
        refreshUndecided(queryClient);
      }
    },
  });
};

export const useAdmitMembershipApplicationMutation = (): UseMutationResult<
  AdmissionResult,
  Error,
  AdmitMembershipApplicationInput
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
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
      refreshUndecided(queryClient);
      void queryClient.invalidateQueries({ queryKey: PERSONS_QUERY_KEY });
    },
    onError: (error) => {
      if (isNotFoundError(error)) {
        refreshUndecided(queryClient);
      }
    },
  });
};
