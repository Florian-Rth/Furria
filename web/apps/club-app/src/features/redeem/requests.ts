import { apiFetch } from '@/lib/api/api-fetch';
import type { SessionTokens } from '@/lib/api/schemas';
import { SessionTokensSchema } from '@/lib/api/schemas';
import type { InvitationLookup } from './schemas';
import { InvitationLookupSchema } from './schemas';

export const requestInvitationLookup = (token: string): Promise<InvitationLookup> =>
  apiFetch('/api/auth/invitations/lookup', {
    method: 'POST',
    body: { token },
    schema: InvitationLookupSchema,
  });

export const requestInvitationRedeem = (token: string, password: string): Promise<SessionTokens> =>
  apiFetch('/api/auth/invitations/redeem', {
    method: 'POST',
    body: { token, password },
    schema: SessionTokensSchema,
  });
