import { describe, expect, it } from 'vitest';
import { resolveSectionTitle } from './app-sections';

describe('resolveSectionTitle', () => {
  it.each([
    { pathname: '/', expected: 'Übersicht' },
    { pathname: '/profile', expected: 'Profil' },
    { pathname: '/unbekannt', expected: 'Übersicht' },
    { pathname: '', expected: 'Übersicht' },
  ])('titles $pathname as $expected', ({ pathname, expected }) => {
    expect(resolveSectionTitle(pathname)).toBe(expected);
  });
});
