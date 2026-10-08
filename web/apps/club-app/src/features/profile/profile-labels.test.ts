import { describe, expect, it } from 'vitest';
import type { MemberContact } from '@/features/members';
import type { MePerson } from '@/lib/api/schemas';
import { toPreviewContact } from './profile-labels';

const PAULA: MePerson = {
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
  contactChange: null,
};

describe('toPreviewContact', () => {
  it.each<[string, boolean, MemberContact]>([
    [
      'shares every contact field when the switch is on',
      true,
      {
        visibility: 'shared',
        phone: '0170 44 21 883',
        email: 'paula@example.org',
        street: 'Am Anger 7',
        zip: '99713',
        city: 'Großfurra',
      },
    ],
    [
      'withholds every contact field when the switch is off',
      false,
      { visibility: 'hidden', phone: null, email: null, street: null, zip: null, city: null },
    ],
  ])('%s', (_case, visible, expected) => {
    expect(toPreviewContact(PAULA, visible)).toEqual(expected);
  });
});
