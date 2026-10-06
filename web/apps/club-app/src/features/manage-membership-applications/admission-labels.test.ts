import { describe, expect, it } from 'vitest';
import {
  toAdmissionConsequence,
  toAdmissionQuickChoices,
  toCandidateDescription,
  toCandidateStanding,
  toCandidatesContext,
  toGapNote,
} from './admission-labels';
import type { AdmissionCandidate, MembershipApplicationDetails } from './schemas';

const application = (
  overrides: Partial<MembershipApplicationDetails>,
): MembershipApplicationDetails => ({
  membershipApplicationId: 7,
  firstName: 'Mia',
  lastName: 'Schwarzwälder',
  birthDate: '1996-04-03',
  age: 30,
  isMinor: false,
  street: 'Rosenweg 12a',
  zip: '50667',
  city: 'Köln',
  email: 'mia@example.com',
  phone: null,
  submittedAt: '2026-09-29T08:00:00+00:00',
  confirmedAt: '2026-09-29T08:05:00+00:00',
  appliedOn: '2026-09-29',
  ageOfConsent: 16,
  candidates: [],
  ...overrides,
});

const candidate = (overrides: Partial<AdmissionCandidate>): AdmissionCandidate => ({
  personId: 12,
  firstName: 'Mia',
  lastName: 'Schwarzwälder',
  birthDate: null,
  email: null,
  city: null,
  membershipState: 'none',
  memberSince: null,
  isMember: false,
  groups: [],
  roles: [],
  hasAccount: false,
  isAffiliated: false,
  gaps: [],
  ...overrides,
});

describe('toCandidateStanding', () => {
  it.each([
    {
      standing: candidate({ isMember: true, membershipState: 'active' }),
      expected: 'ist bereits Mitglied',
    },
    {
      standing: candidate({ membershipState: 'ended', groups: ['Tanzgarde'] }),
      expected: 'Mitglied beendet · in Tanzgarde',
    },
    {
      standing: candidate({ groups: ['Tanzgarde', 'Elferrat'], roles: ['Kassenwartin'] }),
      expected: 'in Tanzgarde, Elferrat · Kassenwartin',
    },
    { standing: candidate({}), expected: 'kein Verein' },
  ])('reads "$expected"', ({ standing, expected }) => {
    expect(toCandidateStanding(standing)).toBe(expected);
  });
});

describe('toCandidateDescription', () => {
  it('lists what identifies her, then where she stands', () => {
    expect(
      toCandidateDescription(
        candidate({
          birthDate: '1996-04-03',
          email: 'mia@example.com',
          city: 'Bonn',
          membershipState: 'ended',
        }),
      ),
    ).toBe('geb. 03.04.1996 · mia@example.com · Bonn · Mitglied beendet');
  });

  it('leaves out what the registry does not hold', () => {
    expect(toCandidateDescription(candidate({ email: '' }))).toBe('kein Verein');
  });
});

describe('toGapNote', () => {
  it('names what the application fills in', () => {
    expect(toGapNote(candidate({ gaps: ['birthDate', 'address'] }))).toBe(
      'Aus dem Antrag ergänzt: Geburtsdatum, Anschrift. Alles andere bleibt, wie es im Register steht.',
    );
  });

  it('says so when the registry already holds everything', () => {
    expect(toGapNote(candidate({ gaps: [] }))).toBe(
      'Der Antrag ergänzt nichts – alles steht schon im Register.',
    );
  });
});

describe('toAdmissionQuickChoices', () => {
  it.each([
    { today: new Date(2026, 9, 2), expected: ['2026-10-02', '2026-11-11'] },
    { today: new Date(2026, 10, 11), expected: ['2026-11-11', '2027-11-11'] },
    { today: new Date(2027, 0, 15), expected: ['2027-01-15', '2027-11-11'] },
  ])('offers today and the next session opening: $expected', ({ today, expected }) => {
    expect(toAdmissionQuickChoices(today).map((choice) => choice.value)).toEqual(expected);
  });
});

describe('toAdmissionConsequence', () => {
  const today = '2026-10-02';

  it('names a new person, her first day and where the invitation goes', () => {
    expect(
      toAdmissionConsequence({
        application: application({}),
        candidate: null,
        admittedOn: today,
        today,
        invitation: 'sent',
      }),
    ).toBe(
      'Mia wird neu angelegt und ist ab dem 02.10.2026 Mitglied. Die Einladung zur App geht gleich an mia@example.com. Der Antrag wird danach gelöscht.',
    );
  });

  it('keeps a former member her Mitglied seit and dates the invitation', () => {
    expect(
      toAdmissionConsequence({
        application: application({}),
        candidate: candidate({ memberSince: '2017-09-01' }),
        admittedOn: '2026-11-11',
        today,
        invitation: 'notYetAffiliated',
      }),
    ).toBe(
      'Mia wird am 11.11.2026 Mitglied, Mitglied seit 01.09.2017 bleibt. Einladen kannst du sie ab dem 11.11.2026. Der Antrag wird danach gelöscht.',
    );
  });

  it.each([
    { invitation: 'alreadyHasAccount', expected: 'Einen Zugang zur App hat sie schon.' },
    { invitation: 'belowAgeOfConsent', expected: 'Eine Einladung zur App gibt es erst ab 16.' },
  ] as const)('explains why no invitation goes out: $invitation', ({ invitation, expected }) => {
    expect(
      toAdmissionConsequence({
        application: application({}),
        candidate: candidate({}),
        admittedOn: today,
        today,
        invitation,
      }),
    ).toBe(`Mia ist ab dem 02.10.2026 Mitglied. ${expected} Der Antrag wird danach gelöscht.`);
  });
});

describe('toCandidatesContext', () => {
  it.each([
    { count: 0, expected: 'Niemand im Register passt zu Mia.' },
    { count: 1, expected: '1 Person im Register passt zu Mia.' },
    { count: 2, expected: '2 Personen im Register passen zu Mia.' },
  ])('counts $count matches', ({ count, expected }) => {
    const candidates = Array.from({ length: count }, (_, index) =>
      candidate({ personId: index + 1 }),
    );

    expect(toCandidatesContext(application({ candidates }))).toBe(expected);
  });
});
