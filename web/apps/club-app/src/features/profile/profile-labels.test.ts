import { describe, expect, it } from 'vitest';
import type { Me, MePerson } from '@/lib/api/schemas';
import { toPreviewContact, toProfileHeadline } from './profile-labels';

const person = (overrides: Partial<MePerson> = {}): MePerson => ({
  id: 7,
  firstName: 'Paula',
  lastName: 'Brendel',
  email: 'paula@example.org',
  phone: '0170 44 21 883',
  street: 'Am Anger 7',
  zip: '99713',
  city: 'Großfurra',
  birthDate: '1996-03-12',
  contactVisibleToMembers: true,
  ...overrides,
});

const me = (state: Me['membership']['state']): Me => ({
  accountId: 3,
  email: 'paula@example.org',
  person: person(),
  membership: { state, memberSince: null, currentStartedOn: null, currentEndedOn: null },
  isAffiliated: true,
  permissionKeys: [],
});

describe('toProfileHeadline', () => {
  it('falls back to the route noun while the query is pending', () => {
    expect(toProfileHeadline(undefined)).toEqual({ title: 'Profil', initials: '', state: null });
  });

  it('names the viewer and paints her own state chip', () => {
    expect(toProfileHeadline(me('paused'))).toEqual({
      title: 'Paula Brendel',
      initials: 'PB',
      state: { label: 'ruht', tone: 'gold', dot: true },
    });
  });
});

describe('toPreviewContact', () => {
  it('shares every contact field when the switch is on', () => {
    expect(toPreviewContact(person(), true)).toEqual({
      visibility: 'shared',
      phone: '0170 44 21 883',
      email: 'paula@example.org',
      street: 'Am Anger 7',
      zip: '99713',
      city: 'Großfurra',
    });
  });

  it('withholds every contact field when the switch is off', () => {
    expect(toPreviewContact(person(), false)).toEqual({
      visibility: 'hidden',
      phone: null,
      email: null,
      street: null,
      zip: null,
      city: null,
    });
  });

  it('shares an unset field as unset, not as withheld', () => {
    const sparse = person({ phone: null, street: null, zip: null, city: null });

    expect(toPreviewContact(sparse, true)).toEqual({
      visibility: 'shared',
      phone: null,
      email: 'paula@example.org',
      street: null,
      zip: null,
      city: null,
    });
  });

  it('never carries the birth date into the preview', () => {
    expect(toPreviewContact(person(), true)).not.toHaveProperty('birthDate');
  });
});
