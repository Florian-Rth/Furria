import { describe, expect, it } from 'vitest';
import { isSessionClosed, sessionSearchOf } from './acts-session';

describe('isSessionClosed', () => {
  it.each<[number | null, boolean]>([
    [null, false],
    [2025, true],
    [2026, false],
    [2027, false],
  ])('session %s → %s', (sessionYear, expected) => {
    expect(isSessionClosed(sessionYear, 2026)).toBe(expected);
  });
});

describe('sessionSearchOf', () => {
  it.each<[number | null, number | undefined]>([
    [null, undefined],
    [2026, undefined],
    [2027, 2027],
    [2025, 2025],
  ])('session %s → %s', (sessionYear, expected) => {
    expect(sessionSearchOf(sessionYear, 2026)).toBe(expected);
  });
});
