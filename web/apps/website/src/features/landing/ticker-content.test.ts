import { describe, expect, it } from 'vitest';
import { buildTickerPhrases } from './ticker-content';

describe('buildTickerPhrases', () => {
  it.each([
    ['still loading', undefined, 2],
    ['not yet proclaimed', { startYear: 2026, label: '2026/27', motto: null }, 3],
    ['proclaimed', { startYear: 2026, label: '2026/27', motto: 'Großes Theater' }, 4],
  ])('carries %s sessions in %i phrases', (_, session, expected) => {
    expect(buildTickerPhrases(session)).toHaveLength(expected);
  });

  it('shouts the proclaimed motto', () => {
    const session = { startYear: 2026, label: '2026/27', motto: 'Furria — Großes Theater' };

    expect(buildTickerPhrases(session).at(-1)).toBe('FURRIA — GROSSES THEATER');
  });
});
