import { apiFetch } from '@/lib/api/api-fetch';
import type { NoContent } from '@/lib/api/schemas';
import { NoContentSchema } from '@/lib/api/schemas';
import type { AccessState, InPersonInvitation, IssuedInvitation } from './schemas';
import { AccessStateSchema, InPersonInvitationSchema, IssuedInvitationSchema } from './schemas';
import type { InPersonPurpose } from './types';

export const requestMailInvitation = (
  personId: number,
  accessToken: string,
): Promise<IssuedInvitation> =>
  apiFetch(`/api/manage/persons/${personId}/invitations`, {
    method: 'POST',
    schema: IssuedInvitationSchema,
    accessToken,
  });

const IN_PERSON_PATHS: Record<InPersonPurpose, (personId: number) => string> = {
  onboarding: (personId) => `/api/manage/persons/${personId}/invitations/in-person`,
  recovery: (personId) => `/api/manage/persons/${personId}/access-recovery`,
};

export const requestInPersonInvitation = (
  purpose: InPersonPurpose,
  personId: number,
  accessToken: string,
): Promise<InPersonInvitation> =>
  apiFetch(IN_PERSON_PATHS[purpose](personId), {
    method: 'POST',
    schema: InPersonInvitationSchema,
    accessToken,
  });

export const requestAccountDisabled = (
  personId: number,
  isDisabled: boolean,
  accessToken: string,
): Promise<NoContent> =>
  apiFetch(`/api/manage/persons/${personId}/account/disabled`, {
    method: 'PUT',
    body: { isDisabled },
    schema: NoContentSchema,
    accessToken,
  });

export const requestAccessState = (personId: number, accessToken: string): Promise<AccessState> =>
  apiFetch(`/api/manage/persons/${personId}/access-state`, {
    schema: AccessStateSchema,
    accessToken,
  });
