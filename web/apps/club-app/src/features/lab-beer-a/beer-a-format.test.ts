import { describe, expect, it } from 'vitest';
import { dayOf, paceOfDay, shortDayOf } from './beer-a-format';

describe('dayOf', () => {
  it.each([
    ['2026-11-02T18:00:00.000Z', 'Mo 02.11.'],
    ['2026-11-04T23:30:00.000Z', 'Do 05.11.'],
  ])('formats %s in Berlin as %s', (iso, expected) => {
    expect(dayOf(iso)).toBe(expected);
  });
});

describe('shortDayOf', () => {
  it('formats day and month', () => {
    expect(shortDayOf('2026-10-12T17:00:00.000Z')).toBe('12.10.');
  });
});

describe('paceOfDay', () => {
  it('keeps one decimal', () => {
    expect(paceOfDay(1.619)).toBe('1,6');
  });
});
