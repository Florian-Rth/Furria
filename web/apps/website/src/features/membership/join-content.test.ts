import { describe, expect, it } from 'vitest';
import type { Session } from '@/lib/club';
import { buildJoinStats } from './join-content';

const session: Session = { number: 56, startYear: 2026, yearsLabel: '2026/27' };

describe('buildJoinStats', () => {
  it('derives exactly three stats from the club figures and the running Session', () => {
    expect(buildJoinStats('180+', 6, session)).toEqual([
      { value: '180+', label: 'Mitglieder' },
      { value: '6', label: 'Garden & Gruppen' },
      { value: '56.', label: 'Session' },
    ]);
  });

  it('never invents a fourth stat', () => {
    expect(buildJoinStats('180+', 6, session)).toHaveLength(3);
  });

  it('counts the Session ordinal from the one it is given', () => {
    const stats = buildJoinStats('180+', 6, { number: 57, startYear: 2027, yearsLabel: '2027/28' });

    expect(stats[2]).toEqual({ value: '57.', label: 'Session' });
  });
});
