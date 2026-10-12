import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import type { RedeemErrorPlacement } from './redeem-messages';
import { redeemErrorPlacementOf } from './redeem-messages';

describe('redeemErrorPlacementOf', () => {
  it.each<[string, Error | null, RedeemErrorPlacement | null]>([
    ['no error', null, null],
    [
      'a taken login email',
      new ApiError({
        kind: 'refused',
        status: 409,
        fields: [{ field: 'loginEmail', message: 'vergeben' }],
      }),
      { slot: 'loginEmail', failure: 'taken', fromServer: true },
    ],
    [
      'a rejected confirmation code',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'confirmationCode', message: 'falsch' }],
      }),
      { slot: 'confirmationCode', failure: 'codeRejected', fromServer: true },
    ],
    [
      'a wrong password for the claimed account',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'claimPassword', message: 'passt nicht' }],
      }),
      { slot: 'claimPassword', failure: 'claimRejected', fromServer: true },
    ],
    [
      'a passkey that does not prove the claimed account',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'claimPasskey', message: 'nicht bestätigt' }],
      }),
      { slot: 'claimPasskey', failure: 'claimPasskeyRejected', fromServer: true },
    ],
    [
      'a passkey ceremony that failed on the device',
      new DOMException('insecure', 'SecurityError'),
      { slot: 'claimPasskey', failure: 'claimPasskeyRejected', fromServer: false },
    ],
    ['a passkey ceremony she cancelled', new DOMException('cancelled', 'NotAllowedError'), null],
    [
      'a rejected password',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'password', message: 'zu schwach' }],
      }),
      { slot: 'footer', failure: 'rejected', fromServer: true },
    ],
    [
      'a dead invitation with a problem body',
      new ApiError({ kind: 'refused', status: 409, fields: [] }),
      { slot: 'footer', failure: 'dead', fromServer: false },
    ],
    [
      'a rate limit',
      new ApiError({ kind: 'throttled' }),
      { slot: 'footer', failure: 'throttled', fromServer: false },
    ],
  ])('places the message of %s', (_case, error, expected) => {
    expect(redeemErrorPlacementOf(error)).toEqual(expected);
  });
});
