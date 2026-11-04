import { describe, expect, it } from 'vitest';
import { dayOf, monthKeyOf, paceLabelOf, signedOf, timeOf, weekdayDayOf } from './ledger-format';

describe('ledger formats', () => {
  it.each([
    ['2026-10-22T17:05:00.000Z', '22.10.'],
    ['2026-10-31T23:30:00.000Z', '01.11.'],
  ])('formats the Berlin day of %s', (iso, day) => {
    expect(dayOf(iso)).toBe(day);
  });

  it('formats the Berlin time', () => {
    expect(timeOf('2026-11-04T18:40:00.000Z')).toBe('19:40');
  });

  it('formats a weekday with its day', () => {
    expect(weekdayDayOf('2026-11-10T12:00:00.000Z')).toBe('Di 10.11.');
  });

  it.each([
    ['2026-10-31T22:30:00.000Z', '2026-10'],
    ['2026-10-31T23:30:00.000Z', '2026-11'],
  ])('keys the Berlin month of %s', (iso, key) => {
    expect(monthKeyOf(iso)).toBe(key);
  });

  it('formats the pace with one decimal', () => {
    expect(paceLabelOf(34 / 21)).toBe('1,6');
  });

  it.each([
    [25, '+25'],
    [-2, '−2'],
  ])('signs %i', (count, signed) => {
    expect(signedOf(count)).toBe(signed);
  });
});
