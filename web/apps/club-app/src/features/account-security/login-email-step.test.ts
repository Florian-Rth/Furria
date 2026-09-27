import { describe, expect, it } from 'vitest';
import type { LoginEmailStep, PendingLoginEmail } from './login-email-step';
import { isCurrentLoginEmail, toLoginEmailStep } from './login-email-step';

describe('toLoginEmailStep', () => {
  it.each<[string, PendingLoginEmail | null, boolean, LoginEmailStep]>([
    ['nothing sent yet', null, false, { kind: 'address' }],
    ['nothing sent and a refused address', null, true, { kind: 'address' }],
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

describe('isCurrentLoginEmail', () => {
  it.each([
    ['the same address', 'anna@web.de', 'anna@web.de', true],
    ['the same address in other case and with spaces', ' Anna@Web.DE ', 'anna@web.de', true],
    ['another address', 'anna.muster@web.de', 'anna@web.de', false],
  ])('reads %s as current: %s', (_case, typed, current, expected) => {
    expect(isCurrentLoginEmail(typed, current)).toBe(expected);
  });
});
