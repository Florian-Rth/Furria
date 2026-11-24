import { describe, expect, it } from 'vitest';
import { dayKeyOf } from './beer-time';

describe('dayKeyOf', () => {
  it.each([
    ['2026-11-04T23:30:00.000Z', '2026-11-05'],
    ['2026-07-01T22:30:00.000Z', '2026-07-02'],
  ])('places %s on the Berlin day %s', (at, key) => {
    expect(dayKeyOf(at)).toBe(key);
  });
});
