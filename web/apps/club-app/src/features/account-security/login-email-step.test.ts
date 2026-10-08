import { describe, expect, it } from 'vitest';
import type { LoginEmailStep, PendingLoginEmail } from './login-email-step';
import { toLoginEmailStep } from './login-email-step';

describe('toLoginEmailStep', () => {
  it.each<[string, PendingLoginEmail | null, boolean, LoginEmailStep]>([
    ['nothing sent yet', null, false, { kind: 'address' }],
    [
      'a code on its way',
      {
        loginEmail: 'anna@web.de',
        updateContactEmail: true,
        expiresAt: '2026-10-03T18:15:00+00:00',
      },
      false,
      {
        kind: 'code',
        loginEmail: 'anna@web.de',
        updateContactEmail: true,
        expiresAt: '2026-10-03T18:15:00+00:00',
      },
    ],
    [
      'an address taken while the code was on its way',
      {
        loginEmail: 'anna@web.de',
        updateContactEmail: false,
        expiresAt: '2026-10-03T18:15:00+00:00',
      },
      true,
      { kind: 'address' },
    ],
  ])('shows the step for %s', (_case, pending, loginEmailRefused, expected) => {
    expect(toLoginEmailStep(pending, loginEmailRefused)).toEqual(expected);
  });
});
