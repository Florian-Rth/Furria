import { describe, expect, it } from 'vitest';
import type { Me, MePerson } from '@/lib/api/schemas';
import { asksClubGroupConsentOf, owedWelcomeOf } from './welcome-plan';

const PERSON: MePerson = {
  id: 4,
  firstName: 'Lena',
  lastName: 'Muster',
  email: null,
  phone: null,
  street: null,
  zip: null,
  city: null,
  birthDate: null,
  contactVisibleToMembers: false,
  clubGroupConsent: false,
  contactChange: null,
  portrait: null,
};

const ME: Me = {
  accountId: 1,
  email: 'lena@example.org',
  person: PERSON,

  membership: {
    state: 'active',
    memberSince: '2014-03-01',
    currentStartedOn: '2014-03-01',
    currentEndedOn: null,
    relevantSession: { startYear: 2026, ordinal: 13 },
  },
  isAffiliated: true,
  permissionKeys: [],
  lastSeenAnnouncementAt: null,
  welcomeSeenAt: null,
  appSince: null,
  passkeys: [],
  honours: { sessions: 12, functions: [] },
  keepsClubGroup: true,
};

describe('owedWelcomeOf', () => {
  it.each([
    {
      name: 'a person who saw it',
      me: { ...ME, welcomeSeenAt: '2026-11-11T10:11:00Z' },
      owed: false,
    },
    { name: 'a managing login', me: { ...ME, person: null }, owed: false },
  ])('owes the welcome to $name: $owed', ({ me, owed }) => {
    expect(owedWelcomeOf(me) !== null).toBe(owed);
  });
});

describe('asksClubGroupConsentOf', () => {
  it.each([
    { name: 'a managing login', me: { ...ME, person: null }, asks: false },
    {
      name: 'anyone while the club group takes nobody',
      me: { ...ME, keepsClubGroup: false },
      asks: false,
    },
  ])('asks $name: $asks', ({ me, asks }) => {
    expect(asksClubGroupConsentOf(me)).toBe(asks);
  });
});
