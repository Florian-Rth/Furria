import { describe, expect, it } from 'vitest';
import type { AccessActions } from './access-actions';
import { accessActionsOf } from './access-actions';

type ActionsInput = Parameters<typeof accessActionsOf>[0];

describe('accessActionsOf', () => {
  it.each<[string, ActionsInput, AccessActions]>([
    [
      'an eligible person never invited',
      {
        access: {
          state: 'noAccess',
          reason: null,
          invitation: null,
          history: [],
          rights: { canInvite: true, canManageAccount: false },
          ageOfConsent: 16,
        },
        email: 'anna@web.de',
        isOwnAccount: false,
      },
      {
        mailInvitation: 'invite',
        inPersonInvitation: true,
        lacksMailAddress: false,
        vouchesForAge: false,
        recovery: false,
        lock: null,
      },
    ],
    [
      'a person whose invitation expired',
      {
        access: {
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
          rights: { canInvite: true, canManageAccount: false },
          ageOfConsent: 16,
        },
        email: 'anna@web.de',
        isOwnAccount: false,
      },
      {
        mailInvitation: 'reinvite',
        inPersonInvitation: true,
        lacksMailAddress: false,
        vouchesForAge: false,
        recovery: false,
        lock: null,
      },
    ],
    [
      'an invited state without an invitation block',
      {
        access: {
          state: 'invited',
          reason: null,
          invitation: null,
          history: [],
          rights: { canInvite: true, canManageAccount: false },
          ageOfConsent: 16,
        },
        email: 'anna@web.de',
        isOwnAccount: false,
      },
      {
        mailInvitation: 'reinvite',
        inPersonInvitation: true,
        lacksMailAddress: false,
        vouchesForAge: false,
        recovery: false,
        lock: null,
      },
    ],
    [
      'a person under age, even for a viewer who manages accounts',
      {
        access: {
          state: 'noAccess',
          reason: 'underAge',
          invitation: null,
          history: [],
          rights: { canInvite: true, canManageAccount: true },
          ageOfConsent: 16,
        },
        email: 'anna@web.de',
        isOwnAccount: false,
      },
      {
        mailInvitation: null,
        inPersonInvitation: false,
        lacksMailAddress: false,
        vouchesForAge: false,
        recovery: false,
        lock: null,
      },
    ],
    [
      'a person without birth date and a viewer who only invites',
      {
        access: {
          state: 'noAccess',
          reason: 'noBirthDate',
          invitation: null,
          history: [],
          rights: { canInvite: true, canManageAccount: false },
          ageOfConsent: 16,
        },
        email: 'anna@web.de',
        isOwnAccount: false,
      },
      {
        mailInvitation: null,
        inPersonInvitation: false,
        lacksMailAddress: false,
        vouchesForAge: false,
        recovery: false,
        lock: null,
      },
    ],
    [
      'a person without birth date and a viewer who may vouch',
      {
        access: {
          state: 'noAccess',
          reason: 'noBirthDate',
          invitation: null,
          history: [],
          rights: { canInvite: true, canManageAccount: true },
          ageOfConsent: 16,
        },
        email: 'anna@web.de',
        isOwnAccount: false,
      },
      {
        mailInvitation: 'invite',
        inPersonInvitation: true,
        lacksMailAddress: false,
        vouchesForAge: true,
        recovery: false,
        lock: null,
      },
    ],
    [
      'a person without birth date or email and a viewer who may vouch',
      {
        access: {
          state: 'noAccess',
          reason: 'noBirthDate',
          invitation: null,
          history: [],
          rights: { canInvite: true, canManageAccount: true },
          ageOfConsent: 16,
        },
        email: null,
        isOwnAccount: false,
      },
      {
        mailInvitation: null,
        inPersonInvitation: true,
        lacksMailAddress: true,
        vouchesForAge: true,
        recovery: false,
        lock: null,
      },
    ],
    [
      'an eligible person and a viewer who only manages accounts',
      {
        access: {
          state: 'noAccess',
          reason: null,
          invitation: null,
          history: [],
          rights: { canInvite: false, canManageAccount: true },
          ageOfConsent: 16,
        },
        email: 'anna@web.de',
        isOwnAccount: false,
      },
      {
        mailInvitation: null,
        inPersonInvitation: false,
        lacksMailAddress: false,
        vouchesForAge: false,
        recovery: false,
        lock: null,
      },
    ],
    [
      'an eligible person with a blank email',
      {
        access: {
          state: 'noAccess',
          reason: null,
          invitation: null,
          history: [],
          rights: { canInvite: true, canManageAccount: false },
          ageOfConsent: 16,
        },
        email: '  ',
        isOwnAccount: false,
      },
      {
        mailInvitation: null,
        inPersonInvitation: true,
        lacksMailAddress: true,
        vouchesForAge: false,
        recovery: false,
        lock: null,
      },
    ],
    [
      'an active account and a viewer who only invites',
      {
        access: {
          state: 'active',
          reason: null,
          invitation: null,
          history: [],
          rights: { canInvite: true, canManageAccount: false },
          ageOfConsent: 16,
        },
        email: 'anna@web.de',
        isOwnAccount: false,
      },
      {
        mailInvitation: null,
        inPersonInvitation: false,
        lacksMailAddress: false,
        vouchesForAge: false,
        recovery: false,
        lock: null,
      },
    ],
    [
      'an active account and a viewer who manages accounts',
      {
        access: {
          state: 'active',
          reason: null,
          invitation: null,
          history: [],
          rights: { canInvite: true, canManageAccount: true },
          ageOfConsent: 16,
        },
        email: 'anna@web.de',
        isOwnAccount: false,
      },
      {
        mailInvitation: null,
        inPersonInvitation: false,
        lacksMailAddress: false,
        vouchesForAge: false,
        recovery: true,
        lock: 'disable',
      },
    ],
    [
      'the viewer’s own active account',
      {
        access: {
          state: 'active',
          reason: null,
          invitation: null,
          history: [],
          rights: { canInvite: true, canManageAccount: true },
          ageOfConsent: 16,
        },
        email: 'anna@web.de',
        isOwnAccount: true,
      },
      {
        mailInvitation: null,
        inPersonInvitation: false,
        lacksMailAddress: false,
        vouchesForAge: false,
        recovery: true,
        lock: null,
      },
    ],
    [
      'a disabled account and a viewer who manages accounts',
      {
        access: {
          state: 'disabled',
          reason: null,
          invitation: null,
          history: [],
          rights: { canInvite: true, canManageAccount: true },
          ageOfConsent: 16,
        },
        email: 'anna@web.de',
        isOwnAccount: false,
      },
      {
        mailInvitation: null,
        inPersonInvitation: false,
        lacksMailAddress: false,
        vouchesForAge: false,
        recovery: false,
        lock: 'enable',
      },
    ],
  ])('offers the right acts for %s', (_case, input, expected) => {
    expect(accessActionsOf(input)).toEqual(expected);
  });
});
