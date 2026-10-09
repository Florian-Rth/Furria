import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReauthenticationProof } from '@/features/account-security';
import { resolveReauthenticationProof } from '@/features/account-security';
import { endSessionWithFarewell, withFreshAccessToken } from '@/lib/api/session/session-store';
import { toIsoDay } from '@/lib/day';
import { queryKeys } from '@/lib/query/reads';
import { isNotFoundError } from '@/lib/query-error';
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
import type { PersonAccessFilter } from './person-access-filter';
import { toPersonArchivedMessage, toPersonRestoredMessage } from './person-archive';
import {
  requestAdoptionCandidate,
  requestFeeReductionCreate,
  requestFeeReductionUpdate,
  requestMembershipCreate,
  requestMembershipUpdate,
  requestPauseCreate,
  requestPauseUpdate,
  requestPerson,
  requestPersonArchived,
  requestPersonCreate,
  requestPersonErasure,
  requestPersons,
  requestPersonUpdate,
} from './requests';
import type {
  AdoptionCandidate,
  CreatedFeeReduction,
  CreatedMembership,
  CreatedPause,
  CreatedPerson,
  FeeReductionForm,
  MembershipForm,
  PauseForm,
  PersonDetails,
  PersonForm,
  PersonsResponse,
} from './schemas';

export const usePersonsQuery = (
  access: PersonAccessFilter | null,
  archived: boolean,
): UseQueryResult<PersonsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.persons(access, archived),
    queryFn: () =>
      withFreshAccessToken((accessToken) => requestPersons(access, archived, accessToken)),
  });

export const usePersonQuery = (personId: number | null): UseQueryResult<PersonDetails, Error> => {
  const load =
    personId === null
      ? skipToken
      : (): Promise<PersonDetails> =>
          withFreshAccessToken((accessToken) => requestPerson(personId, accessToken));

  return useQuery({ queryKey: queryKeys.person(personId), queryFn: load });
};

export const useCreatePersonMutation = (): UseMutationResult<CreatedPerson, Error, PersonForm> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['person'] },
    mutationFn: (form: PersonForm) =>
      withFreshAccessToken((accessToken) => requestPersonCreate(form, accessToken)),
    onSuccess: (_created, form) => {
      raiseNotice({
        tone: 'success',
        message: toPersonCreatedMessage(`${form.firstName} ${form.lastName}`),
      });
    },
  });
};

export const useUpdatePersonMutation = (
  personId: number,
): UseMutationResult<void, Error, PersonForm> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['person'] },
    mutationFn: (form: PersonForm) =>
      withFreshAccessToken((accessToken) => requestPersonUpdate(personId, form, accessToken)),
    onSuccess: (_result, form) => {
      raiseNotice({
        tone: 'success',
        message: toPersonSavedMessage(`${form.firstName} ${form.lastName}`),
      });
    },
  });
};

export interface PersonArchivedInput {
  isArchived: boolean;
  personName: string;
}

export const useSetPersonArchivedMutation = (
  personId: number,
): UseMutationResult<void, Error, PersonArchivedInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['person'] },
    mutationFn: (input: PersonArchivedInput) =>
      withFreshAccessToken((accessToken) =>
        requestPersonArchived(personId, input.isArchived, accessToken),
      ),
    onSuccess: (_result, input) => {
      raiseNotice({
        tone: 'success',
        message: input.isArchived
          ? toPersonArchivedMessage(input.personName)
          : toPersonRestoredMessage(input.personName),
      });
    },
  });
};

export type PersonErasureOutcome = 'erased' | 'alreadyErased';

const erasePerson = async (
  personId: number,
  proof: ReauthenticationProof,
): Promise<PersonErasureOutcome> => {
  const resolved = await resolveReauthenticationProof(proof);

  try {
    await withFreshAccessToken((accessToken) =>
      requestPersonErasure(personId, resolved, accessToken),
    );
    return 'erased';
  } catch (error) {
    if (error instanceof Error && isNotFoundError(error)) {
      return 'alreadyErased';
    }
    throw error;
  }
};

export const usePersonErasureMutation = (
  personId: number,
  isSelf: boolean,
): UseMutationResult<PersonErasureOutcome, Error, ReauthenticationProof> =>
  useMutation({
    mutationFn: async (proof: ReauthenticationProof) => {
      const outcome = await erasePerson(personId, proof);

      if (isSelf) {
        endSessionWithFarewell('person-erased');
      }

      return outcome;
    },
  });

export const useForgetErasedPerson = (): ((personId: number) => void) => {
  const queryClient = useQueryClient();

  return (personId) => {
    queryClient.removeQueries({ queryKey: queryKeys.person(personId), exact: true });
    void queryClient.invalidateQueries();
  };
};

export const useCreateMembershipMutation = (
  personId: number,
): UseMutationResult<CreatedMembership, Error, MembershipForm> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['membership'] },
    mutationFn: (form: MembershipForm) =>
      withFreshAccessToken((accessToken) => requestMembershipCreate(personId, form, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: MEMBERSHIP_ADDED_MESSAGE });
    },
  });
};

export interface MembershipUpdateInput extends MembershipForm {
  membershipId: number;
  wasOpen: boolean;
}

export const useUpdateMembershipMutation = (
  personId: number,
): UseMutationResult<void, Error, MembershipUpdateInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['membership'] },
    mutationFn: (input: MembershipUpdateInput) =>
      withFreshAccessToken((accessToken) =>
        requestMembershipUpdate(
          personId,
          input.membershipId,
          { startedOn: input.startedOn, endedOn: input.endedOn },
          accessToken,
        ),
      ),
    onSuccess: (_result, input) => {
      const message =
        input.wasOpen && input.endedOn !== null
          ? toMembershipEndedMessage(input.endedOn, toIsoDay(new Date()))
          : MEMBERSHIP_SAVED_MESSAGE;

      raiseNotice({ tone: 'success', message });
    },
  });
};

export interface PauseCreateInput extends PauseForm {
  membershipId: number;
}

export const useCreatePauseMutation = (
  personId: number,
): UseMutationResult<CreatedPause, Error, PauseCreateInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['membership'] },
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
      raiseNotice({ tone: 'success', message: PAUSE_ADDED_MESSAGE });
    },
  });
};

export interface PauseUpdateInput extends PauseCreateInput {
  pauseId: number;
}

export const useUpdatePauseMutation = (
  personId: number,
): UseMutationResult<void, Error, PauseUpdateInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['membership'] },
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
      raiseNotice({ tone: 'success', message: PAUSE_SAVED_MESSAGE });
    },
  });
};

export const useCreateFeeReductionMutation = (
  personId: number,
): UseMutationResult<CreatedFeeReduction, Error, FeeReductionForm> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['membership'] },
    mutationFn: (form: FeeReductionForm) =>
      withFreshAccessToken((accessToken) => requestFeeReductionCreate(personId, form, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: FEE_REDUCTION_ADDED_MESSAGE });
    },
  });
};

export interface FeeReductionUpdateInput extends FeeReductionForm {
  feeReductionId: number;
}

export const useUpdateFeeReductionMutation = (
  personId: number,
): UseMutationResult<void, Error, FeeReductionUpdateInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['membership'] },
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
      raiseNotice({ tone: 'success', message: FEE_REDUCTION_SAVED_MESSAGE });
    },
  });
};

export const useAdoptionCandidateQuery = (
  email: string | null,
): UseQueryResult<AdoptionCandidate | null, Error> => {
  const load =
    email === null
      ? skipToken
      : (): Promise<AdoptionCandidate | null> =>
          withFreshAccessToken((accessToken) => requestAdoptionCandidate(email, accessToken));

  return useQuery({ queryKey: queryKeys.adoptionCandidate(email), queryFn: load });
};
