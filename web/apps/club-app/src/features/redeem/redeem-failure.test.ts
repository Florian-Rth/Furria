import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { SessionPersistenceError } from '@/lib/api/session/session-error';
import type { RedeemFailureKind } from './redeem-failure';
import { toRedeemFailureKind } from './redeem-failure';

describe('toRedeemFailureKind', () => {
  it.each<[string, Error | null, RedeemFailureKind | null]>([
    ['no error', null, null],
    ['a blocked request', new ApiError({ kind: 'unreachable' }), 'unreachable'],
    ['a server that answered too slowly', new ApiError({ kind: 'timedOut' }), 'timedOut'],
    [
      'a conflict with a problem body',
      new ApiError({ kind: 'refused', status: 409, fields: [] }),
      'dead',
    ],
    ['a conflict without a problem body', new ApiError({ kind: 'status', status: 409 }), 'dead'],
    [
      'a login email already taken',
      new ApiError({
        kind: 'refused',
        status: 409,
        fields: [{ field: 'loginEmail', message: 'vergeben' }],
      }),
      'taken',
    ],
    [
      'a wrong confirmation code',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'confirmationCode', message: 'falsch' }],
      }),
      'codeRejected',
    ],
    [
      'a wrong password for the claimed account',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'claimPassword', message: 'passt nicht' }],
      }),
      'claimRejected',
    ],
    [
      'a passkey that does not prove the claimed account',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'claimPasskey', message: 'nicht bestätigt' }],
      }),
      'claimPasskeyRejected',
    ],
    ['an aborted passkey ceremony', new DOMException('aborted', 'AbortError'), 'passkeyCancelled'],
    [
      'a dismissed or timed out passkey ceremony',
      new DOMException('dismissed', 'NotAllowedError'),
      'passkeyDismissed',
    ],
    ['an account whose session could not be kept', new SessionPersistenceError(), 'sessionLost'],
    [
      'a failed passkey ceremony',
      new DOMException('insecure', 'SecurityError'),
      'claimPasskeyRejected',
    ],
    [
      'a validation refusal',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'password', message: 'zu kurz' }],
      }),
      'rejected',
    ],
    ['a rate limit', new ApiError({ kind: 'throttled' }), 'throttled'],
    ['a server failure', new ApiError({ kind: 'status', status: 500 }), 'unexpected'],
  ])('classifies %s', (_case, error, expected) => {
    expect(toRedeemFailureKind(error)).toBe(expected);
  });
});
