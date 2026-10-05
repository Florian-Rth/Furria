import { describe, expect, it } from 'vitest';
import {
  toApplicationTitle,
  toMembershipApplicationId,
  toWaitingSince,
} from './manage-membership-applications-labels';

describe('toMembershipApplicationId', () => {
  it.each([
    { raw: '7', expected: 7 },
    { raw: '0', expected: null },
    { raw: '07', expected: null },
    { raw: '-3', expected: null },
    { raw: 'mia', expected: null },
  ])('reads "$raw" as $expected', ({ raw, expected }) => {
    expect(toMembershipApplicationId(raw)).toBe(expected);
  });
});

describe('toApplicationTitle', () => {
  it('names the applicant once her application has loaded', () => {
    const details = {
      membershipApplicationId: 7,
      firstName: 'Mia',
      lastName: 'Schwarzwälder',
      birthDate: '2009-03-12',
      age: 17,
      isMinor: true,
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
    };

    expect(toApplicationTitle(details)).toBe('Mia Schwarzwälder');
  });

  it('falls back to the kind of record while it loads', () => {
    expect(toApplicationTitle(undefined)).toBe('Beitrittsantrag');
  });
});

describe('toWaitingSince', () => {
  const now = new Date(2026, 9, 2, 9, 30);

  it.each([
    { confirmedAt: new Date(2026, 9, 2, 0, 15), expected: 'seit heute' },
    { confirmedAt: new Date(2026, 9, 1, 23, 50), expected: 'seit gestern' },
    { confirmedAt: new Date(2026, 8, 29, 18, 0), expected: 'seit 3 Tagen' },
    { confirmedAt: new Date(2026, 9, 2, 9, 45), expected: 'seit heute' },
  ])('reads a confirmation on $confirmedAt as "$expected"', ({ confirmedAt, expected }) => {
    expect(toWaitingSince(confirmedAt.toISOString(), now)).toBe(expected);
  });
});
