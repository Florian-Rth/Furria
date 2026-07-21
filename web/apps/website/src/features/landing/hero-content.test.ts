import { describe, expect, it } from 'vitest';
import { buildEyebrowLabel, buildHeroStats } from './hero-content';

describe('buildEyebrowLabel', () => {
  it('renders session, opening date and the Eröffnung marker', () => {
    expect(buildEyebrowLabel('2025/26', 11, 11)).toBe('★ SESSION 2025/26 · 11.11. ERÖFFNUNG');
  });

  it('tracks whichever session and opening date it is given', () => {
    expect(buildEyebrowLabel('2026/27', 11, 11)).toContain('SESSION 2026/27');
  });
});

describe('buildHeroStats', () => {
  it('pairs each club figure with its German label in order', () => {
    expect(buildHeroStats('180+', 12, 1971)).toEqual([
      { value: '180+', label: 'Mitglieder' },
      { value: '12', label: 'Garden & Gruppen' },
      { value: '1971', label: 'gegründet' },
    ]);
  });
});
