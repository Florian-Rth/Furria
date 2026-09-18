import { describe, expect, it } from 'vitest';
import { buildStoryStats, formatGroupStat, UNKNOWN_STAT_VALUE } from './story-content';

describe('formatGroupStat', () => {
  it('prints the counted Gruppen', () => {
    expect(formatGroupStat(6)).toBe('6');
  });

  it('prints a dash rather than a zero while the count is unknown', () => {
    expect(formatGroupStat(null)).toBe(UNKNOWN_STAT_VALUE);
  });

  it('prints a real zero as a zero', () => {
    expect(formatGroupStat(0)).toBe('0');
  });
});

describe('buildStoryStats', () => {
  it('keeps all three stats while the Gruppen count is still missing', () => {
    const stats = buildStoryStats(1971, '180+', null);

    expect(stats.map((stat) => stat.label)).toEqual(['gegründet', 'Mitglieder', 'Gruppen']);
    expect(stats.map((stat) => stat.value)).toEqual(['1971', '180+', UNKNOWN_STAT_VALUE]);
  });
});
