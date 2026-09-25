import { describe, expect, it } from 'vitest';
import type { AccessActions } from './access-actions';
import { accessActionsOf } from './access-actions';
import type { PersonAccess } from './schemas';

describe('accessActionsOf', () => {
  it.each<[string, PersonAccess, string | null, AccessActions]>([
    [
      'an eligible person never invited',
      { state: 'noAccess', reason: null, invitation: null, history: [] },
      'anna@web.de',
      { mailInvitation: 'invite' },
    ],
    [
      'a person with a live invitation',
      {
        state: 'invited',
        reason: null,
        invitation: {
          channel: 'mail',
          issuedAt: '2026-09-25T18:00:00+00:00',
          issuedBy: null,
          expiresAt: '2026-10-09T18:00:00+00:00',
          isExpired: false,
        },
        history: [],
      },
      'anna@web.de',
      { mailInvitation: 'reinvite' },
    ],
    [
      'a person whose invitation expired',
      {
        state: 'noAccess',
        reason: null,
        invitation: {
          channel: 'mail',
          issuedAt: '2026-09-01T18:00:00+00:00',
          issuedBy: null,
          expiresAt: '2026-09-15T18:00:00+00:00',
          isExpired: true,
        },
        history: [],
      },
      'anna@web.de',
      { mailInvitation: 'reinvite' },
    ],
    [
      'an invited state without an invitation block',
      { state: 'invited', reason: null, invitation: null, history: [] },
      'anna@web.de',
      { mailInvitation: 'reinvite' },
    ],
    [
      'a person under age',
      { state: 'noAccess', reason: 'underAge', invitation: null, history: [] },
      'anna@web.de',
      { mailInvitation: null },
    ],
    [
      'a person without an email the server still calls eligible',
      { state: 'noAccess', reason: null, invitation: null, history: [] },
      null,
      { mailInvitation: null },
    ],
    [
      'a person with a blank email',
      { state: 'noAccess', reason: null, invitation: null, history: [] },
      '  ',
      { mailInvitation: null },
    ],
    [
      'an active account',
      { state: 'active', reason: null, invitation: null, history: [] },
      'anna@web.de',
      { mailInvitation: null },
    ],
    [
      'a disabled account',
      { state: 'disabled', reason: null, invitation: null, history: [] },
      'anna@web.de',
      { mailInvitation: null },
    ],
  ])('offers the right acts for %s', (_case, access, email, expected) => {
    expect(accessActionsOf(access, email)).toEqual(expected);
  });
});
