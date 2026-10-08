import { describe, expect, it } from 'vitest';
import {
  formatAddress,
  formatIsoDay,
  formatSessionSpan,
  formatSinceSession,
} from './membership-labels';

describe('formatIsoDay', () => {
  it.each([
    ['2026-09-07', '07.09.2026'],
    ['2026-9-7', '2026-9-7'],
  ])('formats %s as %s', (isoDay, expected) => {
    expect(formatIsoDay(isoDay)).toBe(expected);
  });
});

describe('formatAddress', () => {
  it.each<[string | null, string | null, string | null, string | null]>([
    ['Hauptstraße 12', '99713 ', 'Großfurra', 'Hauptstraße 12, 99713 Großfurra'],
    [null, '99713', 'Großfurra', '99713 Großfurra'],
    ['Hauptstraße 12', null, null, 'Hauptstraße 12'],
    ['Hauptstraße 12', null, 'Großfurra', 'Hauptstraße 12, Großfurra'],
    ['  ', '', '   ', null],
  ])('joins %o / %o / %o into %o', (street, zip, city, expected) => {
    expect(formatAddress(street, zip, city)).toBe(expected);
  });
});

describe('formatSinceSession', () => {
  it.each([
    ['2018-11-10', '2017/18'],
    ['2018-11-11', '2018/19'],
    ['2019-02-28', '2018/19'],
    ['nicht hinterlegt', 'nicht hinterlegt'],
  ])('reads %s as the session %s', (isoDay, expected) => {
    expect(formatSinceSession(isoDay)).toBe(expected);
  });
});

describe('formatSessionSpan', () => {
  it.each<[number, number, string]>([
    [2025, 2025, '2025/26'],
    [1999, 2000, '1999/00 – 2000/01'],
  ])('spans %i to %i as %s', (first, last, expected) => {
    expect(formatSessionSpan(first, last)).toBe(expected);
  });
});
