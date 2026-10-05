import { describe, expect, it } from 'vitest';
import { buildJoinStats } from './join-content';

describe('buildJoinStats', () => {
  it('shows both counts as unknown while the club is loading', () => {
    expect(buildJoinStats(undefined).map((stat) => stat.value)).toEqual(['—', '—']);
  });

  it('rounds the members and prints the groups once loaded', () => {
    const session = { startYear: 2026, label: '2026/27', motto: null };
    const club = {
      name: null,
      foundedYear: 1971,
      email: null,
      phone: null,
      instagramUrl: null,
      facebookUrl: null,
      memberCount: 183,
      groupCount: 7,
      ageOfConsent: 16,
      session,
    };

    expect(buildJoinStats(club).map((stat) => stat.value)).toEqual(['180+', '7']);
  });
});
