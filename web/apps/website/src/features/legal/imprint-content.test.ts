import { describe, expect, it } from 'vitest';
import type { PublicClub } from '@/lib/public-club/schemas';
import { toContactSection } from './imprint-content';

const clubOf = (record: Partial<PublicClub>): PublicClub => ({
  name: null,
  foundedYear: null,
  street: null,
  zip: null,
  city: null,
  email: null,
  phone: null,
  websiteUrl: null,
  instagramUrl: null,
  facebookUrl: null,
  memberCount: 0,
  groupCount: 0,
  ageOfConsent: 16,
  session: { startYear: 2026, label: '2026/27', motto: null },
  ...record,
});

describe('toContactSection', () => {
  it.each<[string, PublicClub | undefined, string[]]>([
    [
      'the recorded club contact',
      clubOf({ email: 'vorstand@furria.de', phone: '03632 12345' }),
      ['E-Mail: vorstand@furria.de', 'Telefon: 03632 12345'],
    ],
    [
      'the operator address without a club email',
      clubOf({ email: '  ' }),
      ['E-Mail: contact@florianrth.com'],
    ],
    ['the operator address while the club loads', undefined, ['E-Mail: contact@florianrth.com']],
  ])('lists %s', (_, club, expected) => {
    expect(toContactSection(club).paragraphs).toEqual(expected);
  });
});
