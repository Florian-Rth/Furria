import { describe, expect, it } from 'vitest';
import { formatIsoDay, formatMembershipPeriod } from './membership-labels';

describe('formatIsoDay', () => {
  it.each([
    ['2020-11-11', '11.11.2020'],
    ['2025-01-31', '31.01.2025'],
    ['2026-09-07', '07.09.2026'],
    ['2026-9-7', '2026-9-7'],
    ['', ''],
  ])('formats %s as %s', (isoDay, expected) => {
    expect(formatIsoDay(isoDay)).toBe(expected);
  });
});

describe('formatMembershipPeriod', () => {
  it.each([
    ['2020-11-11', null, 'seit 11.11.2020'],
    ['2020-11-11', '2025-01-31', 'seit 11.11.2020 bis 31.01.2025'],
  ])('formats the period from %s to %s', (startedAt, endedAt, expected) => {
    expect(formatMembershipPeriod(startedAt, endedAt)).toBe(expected);
  });
});
