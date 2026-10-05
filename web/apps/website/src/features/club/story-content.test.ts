import { describe, expect, it } from 'vitest';
import { buildStoryStats } from './story-content';

describe('buildStoryStats', () => {
  const session = { startYear: 2026, label: '2026/27', motto: null };

  it('shows every stat as unknown while the club is loading', () => {
    expect(buildStoryStats(undefined).map((stat) => stat.value)).toEqual(['—', '—', '—']);
  });

  it('prints the founding year before the rounded members and the groups', () => {
    const club = {
      name: null,
      foundedYear: 1971,
      email: null,
      phone: null,
      instagramUrl: null,
      facebookUrl: null,
      memberCount: 183,
      groupCount: 0,
      session,
    };

    expect(buildStoryStats(club).map((stat) => stat.value)).toEqual(['1971', '180+', '0']);
  });

  it('leaves the founding year out when the club has not recorded it', () => {
    const club = {
      name: null,
      foundedYear: null,
      email: null,
      phone: null,
      instagramUrl: null,
      facebookUrl: null,
      memberCount: 7,
      groupCount: 3,
      session,
    };

    expect(buildStoryStats(club).map((stat) => stat.value)).toEqual(['7', '3']);
  });
});
