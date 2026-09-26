import type { PasskeyAssertionAttempt } from '@/lib/passkey/passkey-flows';

export type AccountDeletionProof = { kind: 'password'; password: string } | { kind: 'passkey' };

export type ResolvedDeletionProof =
  | { kind: 'password'; password: string }
  | { kind: 'passkey'; attempt: PasskeyAssertionAttempt };
