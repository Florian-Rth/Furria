import type { ResolvedReauthenticationProof } from '@/features/account-security';
import { toReauthenticationBody } from '@/features/account-security';
import { ServerFailureError } from '@/lib/api/api-error';
import type { JsonBody } from '@/lib/api/api-fetch';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { PersonAccessFilter } from './person-access-filter';
import { toPersonsRequestPath } from './person-access-filter';
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
import {
  AdoptionCandidateSchema,
  CreatedFeeReductionSchema,
  CreatedMembershipSchema,
  CreatedPauseSchema,
  CreatedPersonSchema,
  PersonDetailsSchema,
  PersonsResponseSchema,
} from './schemas';

const NOT_FOUND_STATUS = 404;

const toNullable = (value: string): string | null => (value === '' ? null : value);

const toPersonBody = (form: PersonForm): JsonBody => ({
  firstName: form.firstName,
  lastName: form.lastName,
  email: toNullable(form.email),
  phone: toNullable(form.phone),
  street: toNullable(form.street),
  zip: toNullable(form.zip),
  city: toNullable(form.city),
  birthDate: form.birthDate,
  contactVisibleToMembers: form.contactVisibleToMembers,
});

export const requestPersons = (
  access: PersonAccessFilter | null,
  archived: boolean,
  accessToken: string,
): Promise<PersonsResponse> =>
  apiFetch(toPersonsRequestPath(access, archived), { schema: PersonsResponseSchema, accessToken });

export const requestPerson = (personId: number, accessToken: string): Promise<PersonDetails> =>
  apiFetch(`/api/manage/persons/${personId}`, { schema: PersonDetailsSchema, accessToken });

export const requestPersonCreate = (
  form: PersonForm,
  accessToken: string,
): Promise<CreatedPerson> =>
  apiFetch('/api/manage/persons', {
    method: 'POST',
    body: toPersonBody(form),
    schema: CreatedPersonSchema,
    accessToken,
  });

export const requestPersonUpdate = (
  personId: number,
  form: PersonForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/persons/${personId}`, {
    method: 'PUT',
    body: toPersonBody(form),
    schema: NoContentSchema,
    accessToken,
  });

export const requestPersonArchived = (
  personId: number,
  isArchived: boolean,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/persons/${personId}/archived`, {
    method: 'PUT',
    body: { isArchived },
    schema: NoContentSchema,
    accessToken,
  });

export const requestPersonErasure = (
  personId: number,
  proof: ResolvedReauthenticationProof,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/persons/${personId}`, {
    method: 'DELETE',
    body: toReauthenticationBody(proof),
    schema: NoContentSchema,
    accessToken,
  });

export const requestMembershipCreate = (
  personId: number,
  form: MembershipForm,
  accessToken: string,
): Promise<CreatedMembership> =>
  apiFetch(`/api/manage/persons/${personId}/memberships`, {
    method: 'POST',
    body: { startedOn: form.startedOn, endedOn: form.endedOn },
    schema: CreatedMembershipSchema,
    accessToken,
  });

export const requestMembershipUpdate = (
  personId: number,
  membershipId: number,
  form: MembershipForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/persons/${personId}/memberships/${membershipId}`, {
    method: 'PUT',
    body: { startedOn: form.startedOn, endedOn: form.endedOn },
    schema: NoContentSchema,
    accessToken,
  });

export const requestPauseCreate = (
  personId: number,
  membershipId: number,
  form: PauseForm,
  accessToken: string,
): Promise<CreatedPause> =>
  apiFetch(`/api/manage/persons/${personId}/memberships/${membershipId}/pauses`, {
    method: 'POST',
    body: { firstSessionYear: form.firstSessionYear, lastSessionYear: form.lastSessionYear },
    schema: CreatedPauseSchema,
    accessToken,
  });

export const requestPauseUpdate = (
  personId: number,
  membershipId: number,
  pauseId: number,
  form: PauseForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/persons/${personId}/memberships/${membershipId}/pauses/${pauseId}`, {
    method: 'PUT',
    body: { firstSessionYear: form.firstSessionYear, lastSessionYear: form.lastSessionYear },
    schema: NoContentSchema,
    accessToken,
  });

export const requestFeeReductionCreate = (
  personId: number,
  form: FeeReductionForm,
  accessToken: string,
): Promise<CreatedFeeReduction> =>
  apiFetch(`/api/manage/persons/${personId}/fee-reductions`, {
    method: 'POST',
    body: {
      basis: form.basis,
      firstSessionYear: form.firstSessionYear,
      lastSessionYear: form.lastSessionYear,
    },
    schema: CreatedFeeReductionSchema,
    accessToken,
  });

export const requestFeeReductionUpdate = (
  personId: number,
  feeReductionId: number,
  form: FeeReductionForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/persons/${personId}/fee-reductions/${feeReductionId}`, {
    method: 'PUT',
    body: {
      basis: form.basis,
      firstSessionYear: form.firstSessionYear,
      lastSessionYear: form.lastSessionYear,
    },
    schema: NoContentSchema,
    accessToken,
  });

export const requestAdoptionCandidate = async (
  email: string,
  accessToken: string,
): Promise<AdoptionCandidate | null> => {
  try {
    return await apiFetch(
      `/api/manage/persons/adoption-candidate?email=${encodeURIComponent(email)}`,
      { schema: AdoptionCandidateSchema, accessToken },
    );
  } catch (error) {
    if (error instanceof ServerFailureError && error.status === NOT_FOUND_STATUS) {
      return null;
    }

    throw error;
  }
};
