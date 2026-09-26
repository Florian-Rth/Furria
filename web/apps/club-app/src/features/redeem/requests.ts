import type { JsonBody } from '@/lib/api/api-fetch';
import { apiFetch } from '@/lib/api/api-fetch';
import type { PasskeyAssertionAttempt } from '@/lib/passkey/passkey-flows';
import type { InvitationCredential } from './invitation-credential';
import { toCredentialBody } from './invitation-credential';
import type { InvitationLookup, Redemption } from './schemas';
import { InvitationLookupSchema, RedemptionSchema } from './schemas';

export type ClaimProof = { kind: 'password'; password: string } | { kind: 'passkey' };

export type ResolvedClaimProof =
  | { kind: 'password'; password: string }
  | { kind: 'passkey'; attempt: PasskeyAssertionAttempt };

interface RedemptionFields {
  credential: InvitationCredential;
  loginEmail: string;
  password: string | null;
  confirmationCode: string | null;
  updateContactEmail: boolean;
}

export interface RedemptionRequest extends RedemptionFields {
  claimProof: ClaimProof | null;
}

export interface ResolvedRedemptionRequest extends RedemptionFields {
  claimProof: ResolvedClaimProof | null;
}

export const toClaimBody = (proof: ResolvedClaimProof | null): { [key: string]: JsonBody } => {
  if (proof?.kind === 'passkey') {
    return {
      claimPassword: null,
      claimPasskey: {
        challengeId: proof.attempt.challengeId,
        credential: { ...proof.attempt.credential, clientExtensionResults: {} },
      },
    };
  }

  return { claimPassword: proof?.password ?? null, claimPasskey: null };
};

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
  claimProof,
  updateContactEmail,
}: ResolvedRedemptionRequest): Promise<Redemption> =>
  apiFetch('/api/auth/invitations/redeem', {
    method: 'POST',
    body: {
      ...toCredentialBody(credential),
      loginEmail,
      password,
      confirmationCode,
      ...toClaimBody(claimProof),
      updateContactEmail,
    },
    schema: RedemptionSchema,
  });
