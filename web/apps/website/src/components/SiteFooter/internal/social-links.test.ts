import { describe, expect, it } from 'vitest';
import { buildSocialLinks } from './social-links';

describe('buildSocialLinks', () => {
  const club = {
    name: null,
    foundedYear: null,
    email: null,
    phone: null,
    instagramUrl: null,
    facebookUrl: null,
    memberCount: 0,
    groupCount: 0,
    session: { startYear: 2026, label: '2026/27', motto: null },
  };

  it.each([
    ['nothing while loading', undefined, []],
    ['nothing the club has not recorded', club, []],
    [
      'only the recorded network',
      { ...club, instagramUrl: 'https://i.test/furria' },
      ['instagram'],
    ],
    [
      'every recorded network',
      { ...club, instagramUrl: 'https://i.test/furria', facebookUrl: 'https://f.test/furria' },
      ['facebook', 'instagram'],
    ],
  ])('links %s', (_, input, expected) => {
    expect(buildSocialLinks(input).map((link) => link.network)).toEqual(expected);
  });
});
