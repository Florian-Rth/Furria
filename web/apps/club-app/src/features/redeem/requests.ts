import { apiFetch } from '@/lib/api/api-fetch';
import type { InvitationCredential } from './invitation-credential';
import { toCredentialBody } from './invitation-credential';
import type { InvitationLookup, Redemption } from './schemas';
import { InvitationLookupSchema, RedemptionSchema } from './schemas';

export interface RedemptionRequest {
  credential: InvitationCredential;
  loginEmail: string;
  password: string | null;
  confirmationCode: string | null;
  claimPassword: string | null;
}

export const requestInvitationLookup = (
  credential: InvitationCredential,
): Promise<InvitationLookup> =>
  apiFetch('/api/auth/invitations/lookup', {
    method: 'POST',
    body: toCredentialBody(credential),
    schema: InvitationLookupSchema,
  });

export const requestInvitationRedeem = ({
  credential,
  loginEmail,
  password,
  confirmationCode,
  claimPassword,
}: RedemptionRequest): Promise<Redemption> =>
  apiFetch('/api/auth/invitations/redeem', {
    method: 'POST',
    body: {
      ...toCredentialBody(credential),
      loginEmail,
      password,
      confirmationCode,
      claimPassword,
    },
    schema: RedemptionSchema,
  });
