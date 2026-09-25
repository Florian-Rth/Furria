import { apiFetch } from '@/lib/api/api-fetch';
import type { IssuedInvitation } from './schemas';
import { IssuedInvitationSchema } from './schemas';

export const requestMailInvitation = (
  personId: number,
  accessToken: string,
): Promise<IssuedInvitation> =>
  apiFetch(`/api/manage/persons/${personId}/invitations`, {
    method: 'POST',
    schema: IssuedInvitationSchema,
    accessToken,
  });
