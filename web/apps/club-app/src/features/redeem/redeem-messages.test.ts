import { describe, expect, it } from 'vitest';
import { RequestBlockedError, RequestFailedError, ServerFailureError } from '@/lib/api/api-error';
import type { RedeemErrorMessages } from './redeem-messages';
import { toRedeemErrorMessages, toRedeemFailureMessage, toRedeemHeading } from './redeem-messages';
import type { InvitationPurpose } from './redeem-stage';

describe('toRedeemErrorMessages', () => {
  it.each<[string, Error | null, RedeemErrorMessages]>([
    [
      'no error',
      null,
      { loginEmail: null, confirmationCode: null, claimPassword: null, footer: null },
    ],
    [
      'a taken login email',
      new RequestFailedError(409, [{ field: 'loginEmail', message: 'vergeben' }]),
      { loginEmail: 'vergeben', confirmationCode: null, claimPassword: null, footer: null },
    ],
    [
      'a rejected confirmation code',
      new RequestFailedError(400, [{ field: 'confirmationCode', message: 'falsch' }]),
      { loginEmail: null, confirmationCode: 'falsch', claimPassword: null, footer: null },
    ],
    [
      'a wrong password for the claimed account',
      new RequestFailedError(400, [{ field: 'claimPassword', message: 'passt nicht' }]),
      { loginEmail: null, confirmationCode: null, claimPassword: 'passt nicht', footer: null },
    ],
    [
      'a rejected password',
      new RequestFailedError(400, [{ field: 'password', message: 'zu schwach' }]),
      { loginEmail: null, confirmationCode: null, claimPassword: null, footer: 'zu schwach' },
    ],
    [
      'a rate limit',
      new ServerFailureError(429),
      {
        loginEmail: null,
        confirmationCode: null,
        claimPassword: null,
        footer: toRedeemFailureMessage('throttled'),
      },
    ],
    [
      'an unreachable server',
      new RequestBlockedError(),
      {
        loginEmail: null,
        confirmationCode: null,
        claimPassword: null,
        footer: toRedeemFailureMessage('unreachable'),
      },
    ],
  ])('places the message of %s', (_case, error, expected) => {
    expect(toRedeemErrorMessages(error)).toEqual(expected);
  });
});

describe('toRedeemHeading', () => {
  it.each<[InvitationPurpose, string, string]>([
    ['onboarding', 'Anna', 'HALLO ANNA'],
    ['recovery', 'Anna', 'NEUES PASSWORT FÜR ANNA'],
  ])('heads a %s for %s', (purpose, firstName, expected) => {
    expect(toRedeemHeading(purpose, firstName)).toBe(expected);
  });
});
