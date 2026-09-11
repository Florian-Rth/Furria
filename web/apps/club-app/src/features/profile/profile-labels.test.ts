import { describe, expect, it } from 'vitest';
import type { MePerson } from '@/lib/api/schemas';
import { toPreviewContact } from './profile-labels';

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
