import type { QueryKey, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReauthenticationProof } from '@/features/account-security';
import { resolveReauthenticationProof } from '@/features/account-security';
import { useApiMutation } from '@/lib/api/api-mutation';
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

const personScope = (personId: number): readonly QueryKey[] => [
  personQueryKey(personId),
  PERSONS_QUERY_KEY,
  MANAGE_HUB_QUERY_KEY,
  PERSON_SEARCH_QUERY_KEY,
];

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

export const useCreatePersonMutation = (): UseMutationResult<CreatedPerson, Error, PersonForm> =>
  useApiMutation({
    request: requestPersonCreate,
    invalidates: [PERSONS_QUERY_KEY],
    notice: { success: (form) => toPersonCreatedMessage(`${form.firstName} ${form.lastName}`) },
  });

export const useUpdatePersonMutation = (
  personId: number,
): UseMutationResult<void, Error, PersonForm> =>
  useApiMutation({
    request: (form: PersonForm, accessToken) => requestPersonUpdate(personId, form, accessToken),
    invalidates: personScope(personId),
    notice: { success: (form) => toPersonSavedMessage(`${form.firstName} ${form.lastName}`) },
  });

export interface PersonArchivedInput {
  isArchived: boolean;
  personName: string;
}

const toPersonArchivedNotice = (input: PersonArchivedInput): string =>
  input.isArchived
    ? toPersonArchivedMessage(input.personName)
    : toPersonRestoredMessage(input.personName);

export const useSetPersonArchivedMutation = (
  personId: number,
): UseMutationResult<void, Error, PersonArchivedInput> =>
  useApiMutation({
    request: (input: PersonArchivedInput, accessToken) =>
      requestPersonArchived(personId, input.isArchived, accessToken),
    invalidates: personScope(personId),
    notice: { success: toPersonArchivedNotice },
  });

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
): UseMutationResult<CreatedMembership, Error, MembershipForm> =>
  useApiMutation({
    request: (form: MembershipForm, accessToken) =>
      requestMembershipCreate(personId, form, accessToken),
    invalidates: personScope(personId),
    notice: { success: () => MEMBERSHIP_ADDED_MESSAGE },
  });

export interface MembershipUpdateInput extends MembershipForm {
  membershipId: number;
  wasOpen: boolean;
}

const toMembershipUpdateNotice = (input: MembershipUpdateInput): string =>
  input.wasOpen && input.endedOn !== null
    ? toMembershipEndedMessage(input.endedOn, toIsoDay(new Date()))
    : MEMBERSHIP_SAVED_MESSAGE;

export const useUpdateMembershipMutation = (
  personId: number,
): UseMutationResult<void, Error, MembershipUpdateInput> =>
  useApiMutation({
    request: (input: MembershipUpdateInput, accessToken) =>
      requestMembershipUpdate(
        personId,
        input.membershipId,
        { startedOn: input.startedOn, endedOn: input.endedOn },
        accessToken,
      ),
    invalidates: personScope(personId),
    notice: { success: toMembershipUpdateNotice },
  });

export interface PauseCreateInput extends PauseForm {
  membershipId: number;
}

export const useCreatePauseMutation = (
  personId: number,
): UseMutationResult<CreatedPause, Error, PauseCreateInput> =>
  useApiMutation({
    request: (input: PauseCreateInput, accessToken) =>
      requestPauseCreate(
        personId,
        input.membershipId,
        { firstSessionYear: input.firstSessionYear, lastSessionYear: input.lastSessionYear },
        accessToken,
      ),
    invalidates: personScope(personId),
    notice: { success: () => PAUSE_ADDED_MESSAGE },
  });

export interface PauseUpdateInput extends PauseCreateInput {
  pauseId: number;
}

export const useUpdatePauseMutation = (
  personId: number,
): UseMutationResult<void, Error, PauseUpdateInput> =>
  useApiMutation({
    request: (input: PauseUpdateInput, accessToken) =>
      requestPauseUpdate(
        personId,
        input.membershipId,
        input.pauseId,
        { firstSessionYear: input.firstSessionYear, lastSessionYear: input.lastSessionYear },
        accessToken,
      ),
    invalidates: personScope(personId),
    notice: { success: () => PAUSE_SAVED_MESSAGE },
  });

export const useCreateFeeReductionMutation = (
  personId: number,
): UseMutationResult<CreatedFeeReduction, Error, FeeReductionForm> =>
  useApiMutation({
    request: (form: FeeReductionForm, accessToken) =>
      requestFeeReductionCreate(personId, form, accessToken),
    invalidates: personScope(personId),
    notice: { success: () => FEE_REDUCTION_ADDED_MESSAGE },
  });

export interface FeeReductionUpdateInput extends FeeReductionForm {
  feeReductionId: number;
}

export const useUpdateFeeReductionMutation = (
  personId: number,
): UseMutationResult<void, Error, FeeReductionUpdateInput> =>
  useApiMutation({
    request: (input: FeeReductionUpdateInput, accessToken) =>
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
    invalidates: personScope(personId),
    notice: { success: () => FEE_REDUCTION_SAVED_MESSAGE },
  });

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
