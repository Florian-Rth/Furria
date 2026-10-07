import { useKkNotice } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReauthenticationProof } from '@/features/account-security';
import { resolveReauthenticationProof } from '@/features/account-security';
import { endSessionWithFarewell, withFreshAccessToken } from '@/lib/api/session/session-store';
import { toIsoDay } from '@/lib/day';
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

export const PERSONS_QUERY_KEY = ['manage', 'persons'] as const;

export const personQueryKey = (
  personId: number | null,
): readonly [string, string, number | null] => ['manage', 'persons', personId];

const MANAGE_HUB_QUERY_KEY = ['manage-hub'] as const;
const PERSON_SEARCH_QUERY_KEY = ['person-search'] as const;

const refreshPerson = (queryClient: QueryClient, personId: number): void => {
  void queryClient.invalidateQueries({ queryKey: personQueryKey(personId) });
  void queryClient.invalidateQueries({ queryKey: PERSONS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: MANAGE_HUB_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: PERSON_SEARCH_QUERY_KEY });
};

export const useRefreshPerson = (personId: number | null): (() => void) => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: personQueryKey(personId) });
    void queryClient.invalidateQueries({ queryKey: PERSONS_QUERY_KEY });
  };
};

const ALL_ACCESS_KEY = 'all';
const ARCHIVED_KEY = 'archived';
const LISTED_KEY = 'listed';

export const usePersonsQuery = (
  access: PersonAccessFilter | null,
  archived: boolean,
): UseQueryResult<PersonsResponse, Error> =>
  useQuery({
    queryKey: [
      ...PERSONS_QUERY_KEY,
      'access',
      access ?? ALL_ACCESS_KEY,
      archived ? ARCHIVED_KEY : LISTED_KEY,
    ],
    queryFn: () =>
      withFreshAccessToken((accessToken) => requestPersons(access, archived, accessToken)),
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
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (form: PersonForm) =>
      withFreshAccessToken((accessToken) => requestPersonCreate(form, accessToken)),
    onSuccess: (_created, form) => {
      raiseNotice({
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
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (form: PersonForm) =>
      withFreshAccessToken((accessToken) => requestPersonUpdate(personId, form, accessToken)),
    onSuccess: (_result, form) => {
      raiseNotice({
        tone: 'success',
        message: toPersonSavedMessage(`${form.firstName} ${form.lastName}`),
      });
      refreshPerson(queryClient, personId);
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
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
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
      refreshPerson(queryClient, personId);
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
    queryClient.removeQueries({ queryKey: personQueryKey(personId), exact: true });
    void queryClient.invalidateQueries();
  };
};

export const useCreateMembershipMutation = (
  personId: number,
): UseMutationResult<CreatedMembership, Error, MembershipForm> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (form: MembershipForm) =>
      withFreshAccessToken((accessToken) => requestMembershipCreate(personId, form, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: MEMBERSHIP_ADDED_MESSAGE });
      refreshPerson(queryClient, personId);
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
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

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
    onSuccess: (_result, input) => {
      const message =
        input.wasOpen && input.endedOn !== null
          ? toMembershipEndedMessage(input.endedOn, toIsoDay(new Date()))
          : MEMBERSHIP_SAVED_MESSAGE;

      raiseNotice({ tone: 'success', message });
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
  const raiseNotice = useKkNotice();

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
      raiseNotice({ tone: 'success', message: PAUSE_ADDED_MESSAGE });
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
  const raiseNotice = useKkNotice();

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
      raiseNotice({ tone: 'success', message: PAUSE_SAVED_MESSAGE });
      refreshPerson(queryClient, personId);
    },
  });
};

export const useCreateFeeReductionMutation = (
  personId: number,
): UseMutationResult<CreatedFeeReduction, Error, FeeReductionForm> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (form: FeeReductionForm) =>
      withFreshAccessToken((accessToken) => requestFeeReductionCreate(personId, form, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: FEE_REDUCTION_ADDED_MESSAGE });
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
  const raiseNotice = useKkNotice();

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
      raiseNotice({ tone: 'success', message: FEE_REDUCTION_SAVED_MESSAGE });
      refreshPerson(queryClient, personId);
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

  return useQuery({ queryKey: [...PERSONS_QUERY_KEY, 'adoption-candidate', email], queryFn: load });
};
