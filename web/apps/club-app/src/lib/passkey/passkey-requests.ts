import { z } from 'zod';
import { apiFetch } from '@/lib/api/api-fetch';
import type { MePasskey } from '@/lib/api/schemas';
import { MePasskeySchema } from '@/lib/api/schemas';
import type { PasskeyAttestationJson } from './passkey-json';
import { PasskeyCreationOptionsJsonSchema, PasskeyRequestOptionsJsonSchema } from './passkey-json';

const PasskeyCreationChallengeSchema = z.object({
  challengeId: z.string().min(1),
  options: PasskeyCreationOptionsJsonSchema,
});
export type PasskeyCreationChallenge = z.infer<typeof PasskeyCreationChallengeSchema>;

const PasskeyRequestChallengeSchema = z.object({
  challengeId: z.string().min(1),
  options: PasskeyRequestOptionsJsonSchema,
});
export type PasskeyRequestChallenge = z.infer<typeof PasskeyRequestChallengeSchema>;

export const requestPasskeyRequestChallenge = (): Promise<PasskeyRequestChallenge> =>
  apiFetch('/api/auth/passkeys/request-options', {
    method: 'POST',
    schema: PasskeyRequestChallengeSchema,
  });

export const requestPasskeyCreationChallenge = (
  accessToken: string,
): Promise<PasskeyCreationChallenge> =>
  apiFetch('/api/auth/me/passkeys/creation-options', {
    method: 'POST',
    schema: PasskeyCreationChallengeSchema,
    accessToken,
  });

export const requestPasskeyAddition = (
  challengeId: string,
  credential: PasskeyAttestationJson,
  accessToken: string,
): Promise<MePasskey> =>
  apiFetch('/api/auth/me/passkeys', {
    method: 'POST',
    body: { challengeId, credential: { ...credential, clientExtensionResults: {} } },
    schema: MePasskeySchema,
    accessToken,
  });
