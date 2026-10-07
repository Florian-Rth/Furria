import type { JsonBody } from '@/lib/api/api-fetch';
import { provePasskey } from '@/lib/passkey/passkey-flows';
import type { ReauthenticationProof, ResolvedReauthenticationProof } from './types';

export const resolveReauthenticationProof = async (
  proof: ReauthenticationProof,
): Promise<ResolvedReauthenticationProof> =>
  proof.kind === 'password' ? proof : { kind: 'passkey', attempt: await provePasskey() };

export const toReauthenticationBody = (proof: ResolvedReauthenticationProof): JsonBody =>
  proof.kind === 'password'
    ? { password: proof.password }
    : {
        passkey: {
          challengeId: proof.attempt.challengeId,
          credential: { ...proof.attempt.credential, clientExtensionResults: {} },
        },
      };
