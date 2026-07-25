import { describe, expect, it } from 'vitest';
import { currentSession, FOUNDING_YEAR } from '@/lib/club';
import { buildClubHeroRibbon, clubHeroNumeral, clubHeroRibbon } from './hero-content';

describe('buildClubHeroRibbon', () => {
  it('states the founding year and the town', () => {
    expect(buildClubHeroRibbon(1971)).toBe('SEIT 1971 · GROSSBESENSTADT');
  });
});

describe('derived club hero content', () => {
  it('derives the giant numeral from the current session number', () => {
    expect(clubHeroNumeral).toBe(currentSession.number);
  });

  it('derives the ribbon from the founding year', () => {
    expect(clubHeroRibbon).toBe(buildClubHeroRibbon(FOUNDING_YEAR));
  });
});
