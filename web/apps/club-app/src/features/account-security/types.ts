import type { PasskeyAssertionAttempt } from '@/lib/passkey/passkey-flows';

export type ReauthenticationProof = { kind: 'password'; password: string } | { kind: 'passkey' };

export type ResolvedReauthenticationProof =
  | { kind: 'password'; password: string }
  | { kind: 'passkey'; attempt: PasskeyAssertionAttempt };
