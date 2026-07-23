import { kkTheme } from '@furria/ui';
import { describe, expect, it } from 'vitest';
import { FOUNDING_YEAR } from '@/lib/club';
import { chronikChapter, MILESTONES, resolveMilestoneTint } from './chronik-content';

describe('chronikChapter', () => {
  it('is the second numbered chapter', () => {
    expect(chronikChapter.numeral).toBe('02');
    expect(chronikChapter.title).toBe('DIE CHRONIK');
  });
});

describe('MILESTONES', () => {
  it('anchors the first milestone on the real founding year', () => {
    expect(MILESTONES[0]).toMatchObject({
      year: String(FOUNDING_YEAR),
      isPlaceholder: false,
    });
  });

  it('treats 1971 as the single real anchor and flags every other milestone as placeholder', () => {
    const real = MILESTONES.filter((milestone) => !milestone.isPlaceholder);
    expect(real).toHaveLength(1);
    expect(real[0]?.year).toBe(String(FOUNDING_YEAR));
  });

  it('every placeholder milestone names itself a Platzhalter for the club to replace', () => {
    for (const milestone of MILESTONES.filter((entry) => entry.isPlaceholder)) {
      expect(milestone.description).toMatch(/Platzhalter/);
    }
  });

  it('keeps the milestones in ascending chronological order', () => {
    const years = MILESTONES.map((milestone) => Number(milestone.year));
    expect(years).toEqual([...years].sort((a, b) => a - b));
  });
});

describe('resolveMilestoneTint', () => {
  it('tints the first milestone red and the rest gold', () => {
    const palette = (kkTheme.vars ?? kkTheme).palette;
    expect(resolveMilestoneTint(kkTheme, 0)).toBe(palette.primary.main);
    expect(resolveMilestoneTint(kkTheme, 1)).toBe(palette.warning.main);
    expect(resolveMilestoneTint(kkTheme, 4)).toBe(palette.warning.main);
  });
});
