import { describe, expect, it } from 'vitest';
import { formatLongDate, formatShortDate } from './date';

describe('formatLongDate', () => {
  it('spells the month out in German', () => {
    expect(formatLongDate('2026-07-18')).toBe('18. Juli 2026');
  });

  it('drops the leading zero of the day', () => {
    expect(formatLongDate('2026-06-04')).toBe('4. Juni 2026');
  });

  it('uses the German month name for März', () => {
    expect(formatLongDate('2026-03-01')).toBe('1. März 2026');
  });
});

describe('formatShortDate', () => {
  it('renders zero-padded day and month with a trailing dot', () => {
    expect(formatShortDate('2026-07-18')).toBe('18.07.');
  });

  it('pads single-digit days', () => {
    expect(formatShortDate('2026-06-04')).toBe('04.06.');
  });

  it('stays on the club time zone for a New Year date', () => {
    expect(formatShortDate('2027-01-01')).toBe('01.01.');
  });
});
