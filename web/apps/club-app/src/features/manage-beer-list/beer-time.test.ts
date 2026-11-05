import { describe, expect, it } from 'vitest';
import { clockOf, dayKeyOf, dayNameOf, shortDateOf, weekdayDateOf } from './beer-time';

describe('dayKeyOf', () => {
  it.each([
    ['2026-11-04T18:40:00.000Z', '2026-11-04'],
    ['2026-11-04T23:30:00.000Z', '2026-11-05'],
    ['2026-07-01T22:30:00.000Z', '2026-07-02'],
  ])('places %s on the Berlin day %s', (at, key) => {
    expect(dayKeyOf(at)).toBe(key);
  });
});

describe('dayNameOf', () => {
  it.each([
    ['2026-11-04', 'today'],
    ['2026-11-03', 'yesterday'],
    ['2026-10-31', 'date'],
  ] as const)('names %s as %s', (dayKey, name) => {
    expect(dayNameOf(dayKey, '2026-11-04')).toBe(name);
  });
});

describe('formatters', () => {
  it('formats a Berlin clock time', () => {
    expect(clockOf('2026-11-04T20:14:00.000Z')).toBe('21:14');
  });

  it('formats a weekday date', () => {
    expect(weekdayDateOf('2026-10-31')).toBe('Sa 31.10.');
  });

  it('formats a short date on the Berlin day', () => {
    expect(shortDateOf('2026-10-31T23:30:00.000Z')).toBe('01.11.');
  });
});
