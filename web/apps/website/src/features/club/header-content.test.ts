import { describe, expect, it } from 'vitest';
import { currentSession } from '@/lib/club';
import { clubHeroNumeral } from './header-content';

describe('derived club header content', () => {
  it('derives the hero numeral from the current session number', () => {
    expect(clubHeroNumeral).toBe(String(currentSession.number));
  });
});
