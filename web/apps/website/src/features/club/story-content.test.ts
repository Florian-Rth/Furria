import { describe, expect, it } from 'vitest';
import { UNKNOWN_FACT } from '@/lib/public-club/club-facts';
import type { PublicClub } from '@/lib/public-club/schemas';
import { buildStoryStats } from './story-content';

const clubOf = (foundedYear: number | null): PublicClub => ({
  name: null,
  foundedYear,
  email: null,
  phone: null,
  instagramUrl: null,
  facebookUrl: null,
  memberCount: 183,
  groupCount: 0,
  ageOfConsent: 16,
  session: { startYear: 2026, label: '2026/27', motto: null },
});

describe('buildStoryStats', () => {
  it.each<[string, PublicClub | undefined, string[]]>([
    ['the club is loading', undefined, [UNKNOWN_FACT, UNKNOWN_FACT, UNKNOWN_FACT]],
    ['the founding year is recorded', clubOf(1971), ['1971', '180+', '0']],
    ['the founding year is not recorded', clubOf(null), ['180+', '0']],
  ])('shows the stats while %s', (_, club, values) => {
    expect(buildStoryStats(club).map((stat) => stat.value)).toEqual(values);
  });
});
