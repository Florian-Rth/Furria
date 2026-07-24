import { describe, expect, it } from 'vitest';
import { currentSession, FOUNDING_YEAR, MEMBER_COUNT_PLACEHOLDER } from '@/lib/club';
import { GROUPS } from './groups-content';
import { buildStoryStats, storyStats } from './story-content';

describe('buildStoryStats', () => {
  it('builds the four self-consistent club facts in order', () => {
    expect(buildStoryStats(1971, '180+', 6, 55)).toEqual([
      { value: '1971', label: 'gegründet' },
      { value: '180+', label: 'Mitglieder' },
      { value: '6', label: 'Gruppen' },
      { value: '55.', label: 'Session' },
    ]);
  });
});

describe('storyStats', () => {
  it('derives the founding year from lib/club', () => {
    expect(storyStats[0]).toEqual({ value: String(FOUNDING_YEAR), label: 'gegründet' });
  });

  it('uses the shared member-count placeholder', () => {
    expect(storyStats[1]).toEqual({ value: MEMBER_COUNT_PLACEHOLDER, label: 'Mitglieder' });
  });

  it('derives the group count from the GROUPS array, never a hardcoded number', () => {
    const groupStat = storyStats.find((stat) => stat.label === 'Gruppen');
    expect(groupStat?.value).toBe(String(GROUPS.length));
  });

  it('derives the session ordinal from the current session number', () => {
    expect(storyStats[3]).toEqual({ value: `${currentSession.number}.`, label: 'Session' });
  });
});
