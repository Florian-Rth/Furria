import { useKkToast } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toIsoDay } from '@/lib/day';
import {
  FEE_REDUCTION_ADDED_MESSAGE,
  FEE_REDUCTION_SAVED_MESSAGE,
  MEMBERSHIP_ADDED_MESSAGE,
  MEMBERSHIP_SAVED_MESSAGE,
  PAUSE_ADDED_MESSAGE,
  PAUSE_SAVED_MESSAGE,
  toMembershipEndedMessage,
  toPersonCreatedMessage,
  toPersonSavedMessage,
} from './manage-persons-labels';
import {
  requestFeeReductionCreate,
  requestFeeReductionUpdate,
  requestMembershipCreate,
  requestMembershipEnd,
  requestMembershipUpdate,
  requestPauseCreate,
  requestPauseUpdate,
  requestPerson,
  requestPersonCreate,
  requestPersons,
  requestPersonUpdate,
} from './requests';
import type {
  CreatedFeeReduction,
  CreatedMembership,
  CreatedPause,
  CreatedPerson,
  EndMembershipForm,
  FeeReductionForm,
  MembershipForm,
  PauseForm,
  PersonDetails,
  PersonForm,
  PersonsResponse,
} from './schemas';

export const PERSONS_QUERY_KEY = ['manage', 'persons'] as const;

export const personQueryKey = (
  personId: number | null,
): readonly [string, string, number | null] => ['manage', 'persons', personId];

const refreshPerson = (queryClient: QueryClient, personId: number): void => {
  void queryClient.invalidateQueries({ queryKey: personQueryKey(personId) });
  void queryClient.invalidateQueries({ queryKey: PERSONS_QUERY_KEY });
};

export const usePersonsQuery = (): UseQueryResult<PersonsResponse, Error> =>
  useQuery({
    queryKey: PERSONS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestPersons),
  });

export const usePersonQuery = (personId: number | null): UseQueryResult<PersonDetails, Error> => {
  const load =
    personId === null
      ? skipToken
      : (): Promise<PersonDetails> =>
          withFreshAccessToken((accessToken) => requestPerson(personId, accessToken));

  return useQuery({ queryKey: personQueryKey(personId), queryFn: load });
};

export const useCreatePersonMutation = (): UseMutationResult<CreatedPerson, Error, PersonForm> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (form: PersonForm) =>
      withFreshAccessToken((accessToken) => requestPersonCreate(form, accessToken)),
    onSuccess: (_created, form) => {
      showToast({
        tone: 'success',
        message: toPersonCreatedMessage(`${form.firstName} ${form.lastName}`),
      });
      void queryClient.invalidateQueries({ queryKey: PERSONS_QUERY_KEY });
    },
  });
};

export const useUpdatePersonMutation = (
  personId: number,
): UseMutationResult<void, Error, PersonForm> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (form: PersonForm) =>
      withFreshAccessToken((accessToken) => requestPersonUpdate(personId, form, accessToken)),
    onSuccess: (_result, form) => {
      showToast({
        tone: 'success',
        message: toPersonSavedMessage(`${form.firstName} ${form.lastName}`),
      });
      refreshPerson(queryClient, personId);
    },
  });
};

export const useCreateMembershipMutation = (
  personId: number,
): UseMutationResult<CreatedMembership, Error, MembershipForm> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (form: MembershipForm) =>
      withFreshAccessToken((accessToken) => requestMembershipCreate(personId, form, accessToken)),
    onSuccess: () => {
      showToast({ tone: 'success', message: MEMBERSHIP_ADDED_MESSAGE });
      refreshPerson(queryClient, personId);
    },
  });
};

export interface MembershipUpdateInput extends MembershipForm {
  membershipId: number;
}

export const useUpdateMembershipMutation = (
  personId: number,
): UseMutationResult<void, Error, MembershipUpdateInput> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (input: MembershipUpdateInput) =>
      withFreshAccessToken((accessToken) =>
        requestMembershipUpdate(
          personId,
          input.membershipId,
          { startedOn: input.startedOn, endedOn: input.endedOn },
          accessToken,
        ),
      ),
    onSuccess: () => {
      showToast({ tone: 'success', message: MEMBERSHIP_SAVED_MESSAGE });
      refreshPerson(queryClient, personId);
    },
  });
};

export interface MembershipEndInput extends EndMembershipForm {
  membershipId: number;
}

export const useEndMembershipMutation = (
  personId: number,
): UseMutationResult<void, Error, MembershipEndInput> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (input: MembershipEndInput) =>
      withFreshAccessToken((accessToken) =>
        requestMembershipEnd(personId, input.membershipId, { endedOn: input.endedOn }, accessToken),
      ),
    onSuccess: (_result, input) => {
      showToast({
        tone: 'success',
        message: toMembershipEndedMessage(input.endedOn, toIsoDay(new Date())),
      });
      refreshPerson(queryClient, personId);
    },
  });
};

export interface PauseCreateInput extends PauseForm {
  membershipId: number;
}

export const useCreatePauseMutation = (
  personId: number,
): UseMutationResult<CreatedPause, Error, PauseCreateInput> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (input: PauseCreateInput) =>
      withFreshAccessToken((accessToken) =>
        requestPauseCreate(
          personId,
          input.membershipId,
          { firstSessionYear: input.firstSessionYear, lastSessionYear: input.lastSessionYear },
          accessToken,
        ),
      ),
    onSuccess: () => {
      showToast({ tone: 'success', message: PAUSE_ADDED_MESSAGE });
      refreshPerson(queryClient, personId);
    },
  });
};

export interface PauseUpdateInput extends PauseCreateInput {
  pauseId: number;
}

export const useUpdatePauseMutation = (
  personId: number,
): UseMutationResult<void, Error, PauseUpdateInput> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (input: PauseUpdateInput) =>
      withFreshAccessToken((accessToken) =>
        requestPauseUpdate(
          personId,
          input.membershipId,
          input.pauseId,
          { firstSessionYear: input.firstSessionYear, lastSessionYear: input.lastSessionYear },
          accessToken,
        ),
      ),
    onSuccess: () => {
      showToast({ tone: 'success', message: PAUSE_SAVED_MESSAGE });
      refreshPerson(queryClient, personId);
    },
  });
};

export const useCreateFeeReductionMutation = (
  personId: number,
): UseMutationResult<CreatedFeeReduction, Error, FeeReductionForm> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (form: FeeReductionForm) =>
      withFreshAccessToken((accessToken) => requestFeeReductionCreate(personId, form, accessToken)),
    onSuccess: () => {
      showToast({ tone: 'success', message: FEE_REDUCTION_ADDED_MESSAGE });
      refreshPerson(queryClient, personId);
    },
  });
};

export interface FeeReductionUpdateInput extends FeeReductionForm {
  feeReductionId: number;
}

export const useUpdateFeeReductionMutation = (
  personId: number,
): UseMutationResult<void, Error, FeeReductionUpdateInput> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (input: FeeReductionUpdateInput) =>
      withFreshAccessToken((accessToken) =>
        requestFeeReductionUpdate(
          personId,
          input.feeReductionId,
          {
            basis: input.basis,
            firstSessionYear: input.firstSessionYear,
            lastSessionYear: input.lastSessionYear,
          },
          accessToken,
        ),
      ),
    onSuccess: () => {
      showToast({ tone: 'success', message: FEE_REDUCTION_SAVED_MESSAGE });
      refreshPerson(queryClient, personId);
    },
  });
};
