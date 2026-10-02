import { describe, expect, it } from 'vitest';
import { buildEyebrowLabel, buildHeroStats } from './hero-content';

describe('buildEyebrowLabel', () => {
  it('names the advertised session before the opening', () => {
    expect(buildEyebrowLabel('2026/27')).toBe('★ SESSION 2026/27 · 11.11. ERÖFFNUNG');
  });

  it('names only the opening while the session is still loading', () => {
    expect(buildEyebrowLabel(undefined)).toBe('★ 11.11. ERÖFFNUNG');
  });
});

describe('buildHeroStats', () => {
  const session = { startYear: 2026, label: '2026/27', motto: null };

  it('shows every stat as unknown while the club is loading', () => {
    expect(buildHeroStats(undefined).map((stat) => stat.value)).toEqual(['—', '—', '—']);
  });

  it('rounds the members and prints groups and founding year once loaded', () => {
    const club = { name: null, foundedYear: 1971, memberCount: 183, groupCount: 7, session };

    expect(buildHeroStats(club).map((stat) => stat.value)).toEqual(['180+', '7', '1971']);
  });

  it('leaves the founding year out when the club has not recorded it', () => {
    const club = { name: null, foundedYear: null, memberCount: 183, groupCount: 7, session };

    expect(buildHeroStats(club).map((stat) => stat.value)).toEqual(['180+', '7']);
  });
});
