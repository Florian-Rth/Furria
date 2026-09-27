import { apiFetch } from '@/lib/api/api-fetch';
import type { SessionTokens } from '@/lib/api/schemas';
import { SessionTokensSchema } from '@/lib/api/schemas';
import type { PasskeyAssertionAttempt } from '@/lib/passkey/passkey-flows';

export const requestPasskeyLogin = (attempt: PasskeyAssertionAttempt): Promise<SessionTokens> =>
  apiFetch('/api/auth/login/passkey', {
    method: 'POST',
    body: {
      challengeId: attempt.challengeId,
      credential: { ...attempt.credential, clientExtensionResults: {} },
    },
    schema: SessionTokensSchema,
  });
