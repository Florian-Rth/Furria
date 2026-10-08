import { describe, expect, it } from 'vitest';
import { sessionAt } from './club';

describe('sessionAt', () => {
  it.each([
    [new Date(2026, 10, 10), 2025, '2025/26'],
    [new Date(2026, 10, 11), 2026, '2026/27'],
    [new Date(2027, 1, 14), 2026, '2026/27'],
    [new Date(2099, 11, 31), 2099, '2099/00'],
  ])('places %s in the session starting %i (%s)', (date, startYear, yearsLabel) => {
    expect(sessionAt(date)).toEqual({ startYear, yearsLabel });
  });
});
