import { describe, expect, it } from 'vitest';
import { RequestBlockedError, RequestFailedError, ServerFailureError } from '@/lib/api/api-error';
import type { RedeemFailureKind } from './redeem-failure';
import { toRedeemFailureKind } from './redeem-failure';

describe('toRedeemFailureKind', () => {
  it.each<[string, Error | null, RedeemFailureKind | null]>([
    ['no error', null, null],
    ['a blocked request', new RequestBlockedError(), 'unreachable'],
    ['a conflict with a problem body', new RequestFailedError(409, []), 'dead'],
    ['a conflict without a problem body', new ServerFailureError(409), 'dead'],
    [
      'a login email already taken',
      new RequestFailedError(409, [{ field: 'loginEmail', message: 'vergeben' }]),
      'taken',
    ],
    [
      'a wrong confirmation code',
      new RequestFailedError(400, [{ field: 'confirmationCode', message: 'falsch' }]),
      'codeRejected',
    ],
    [
      'a wrong password for the claimed account',
      new RequestFailedError(400, [{ field: 'claimPassword', message: 'passt nicht' }]),
      'claimRejected',
    ],
    [
      'a passkey that does not prove the claimed account',
      new RequestFailedError(400, [{ field: 'claimPasskey', message: 'nicht bestätigt' }]),
      'claimPasskeyRejected',
    ],
    [
      'a cancelled passkey ceremony',
      new DOMException('cancelled', 'NotAllowedError'),
      'passkeyCancelled',
    ],
    [
      'a failed passkey ceremony',
      new DOMException('insecure', 'SecurityError'),
      'claimPasskeyRejected',
    ],
    [
      'a validation refusal',
      new RequestFailedError(400, [{ field: 'password', message: 'zu kurz' }]),
      'rejected',
    ],
    ['a rate limit', new ServerFailureError(429), 'throttled'],
    ['a server failure', new ServerFailureError(500), 'unexpected'],
  ])('classifies %s', (_case, error, expected) => {
    expect(toRedeemFailureKind(error)).toBe(expected);
  });
});
