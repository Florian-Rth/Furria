import { apiFetch } from '@/lib/api/api-fetch';
import type { AccessState, InPersonInvitation, IssuedInvitation } from './schemas';
import { AccessStateSchema, InPersonInvitationSchema, IssuedInvitationSchema } from './schemas';

export const requestMailInvitation = (
  personId: number,
  accessToken: string,
): Promise<IssuedInvitation> =>
  apiFetch(`/api/manage/persons/${personId}/invitations`, {
    method: 'POST',
    schema: IssuedInvitationSchema,
    accessToken,
  });

export const requestInPersonInvitation = (
  personId: number,
  accessToken: string,
): Promise<InPersonInvitation> =>
  apiFetch(`/api/manage/persons/${personId}/invitations/in-person`, {
    method: 'POST',
    schema: InPersonInvitationSchema,
    accessToken,
  });

export const requestAccessState = (personId: number, accessToken: string): Promise<AccessState> =>
  apiFetch(`/api/manage/persons/${personId}/access-state`, {
    schema: AccessStateSchema,
    accessToken,
  });
