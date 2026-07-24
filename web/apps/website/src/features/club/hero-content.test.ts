import { describe, expect, it } from 'vitest';
import { currentSession, FOUNDING_YEAR } from '@/lib/club';
import {
  buildClubHeroEyebrow,
  buildClubHeroRibbon,
  clubHeroEyebrow,
  clubHeroNumeral,
  clubHeroRibbon,
} from './hero-content';

describe('buildClubHeroEyebrow', () => {
  it('names the Verein and the session number', () => {
    expect(buildClubHeroEyebrow(55)).toBe('FURRSCHER CARNEVALS CLUB e.V. · 55. SESSION');
  });

  it('tracks whichever session number it is given', () => {
    expect(buildClubHeroEyebrow(56)).toContain('56. SESSION');
  });
});

describe('buildClubHeroRibbon', () => {
  it('states the founding year and the town', () => {
    expect(buildClubHeroRibbon(1971)).toBe('SEIT 1971 · GROSSBESENSTADT');
  });
});

describe('derived club hero content', () => {
  it('derives the eyebrow from the current session number', () => {
    expect(clubHeroEyebrow).toBe(buildClubHeroEyebrow(currentSession.number));
  });

  it('derives the giant numeral from the current session number', () => {
    expect(clubHeroNumeral).toBe(currentSession.number);
  });

  it('derives the ribbon from the founding year', () => {
    expect(clubHeroRibbon).toBe(buildClubHeroRibbon(FOUNDING_YEAR));
  });
});
