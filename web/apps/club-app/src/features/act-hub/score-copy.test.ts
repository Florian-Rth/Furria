import { describe, expect, it } from 'vitest';
import { sessionTextOf } from './score-copy';

describe('sessionTextOf', () => {
  it.each([
    [2026, 'Session 2026/27'],
    [2099, 'Session 2099/00'],
  ])('formats %i as %s', (year, expected) => {
    expect(sessionTextOf(year)).toBe(expected);
  });
});
