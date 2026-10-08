import { describe, expect, it } from 'vitest';
import { UNKNOWN_FACT } from '@/lib/public-club/club-facts';
import type { PublicClub } from '@/lib/public-club/schemas';
import { buildHeroStats } from './hero-content';

const clubOf = (foundedYear: number | null): PublicClub => ({
  name: null,
  foundedYear,
  email: null,
  phone: null,
  instagramUrl: null,
  facebookUrl: null,
  memberCount: 183,
  groupCount: 7,
  ageOfConsent: 16,
  session: { startYear: 2026, label: '2026/27', motto: null },
});

describe('buildHeroStats', () => {
  it.each<[string, PublicClub | undefined, string[]]>([
    ['the club is loading', undefined, [UNKNOWN_FACT, UNKNOWN_FACT, UNKNOWN_FACT]],
    ['the founding year is recorded', clubOf(1971), ['180+', '7', '1971']],
    ['the founding year is not recorded', clubOf(null), ['180+', '7']],
  ])('shows the stats while %s', (_, club, values) => {
    expect(buildHeroStats(club).map((stat) => stat.value)).toEqual(values);
  });
});
