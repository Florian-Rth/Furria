import { describe, expect, it } from 'vitest';
import type { MembershipState } from '@/lib/api/schemas';
import {
  formatAddress,
  formatIsoDay,
  formatPeriod,
  formatSinceSession,
  toMemberSinceLabel,
} from './membership-labels';

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

describe('formatPeriod', () => {
  it.each([
    ['2017-09-01', null, '01.09.2017 – offen'],
    ['2017-09-01', '2026-02-28', '01.09.2017 – 28.02.2026'],
  ])('formats the period from %s to %s', (startedOn, endedOn, expected) => {
    expect(formatPeriod(startedOn, endedOn)).toBe(expected);
  });
});

describe('formatAddress', () => {
  it.each<[string | null, string | null, string | null, string | null]>([
    ['Hauptstraße 12', '99713 ', 'Großfurra', 'Hauptstraße 12, 99713 Großfurra'],
    [null, '99713', 'Großfurra', '99713 Großfurra'],
    ['Hauptstraße 12', null, null, 'Hauptstraße 12'],
    [null, null, 'Großfurra', 'Großfurra'],
    ['Hauptstraße 12', null, 'Großfurra', 'Hauptstraße 12, Großfurra'],
    [null, null, null, null],
    ['  ', '', '   ', null],
  ])('joins %o / %o / %o into %o', (street, zip, city, expected) => {
    expect(formatAddress(street, zip, city)).toBe(expected);
  });
});

describe('formatSinceSession', () => {
  it.each([
    ['2018-09-01', '2017/18'],
    ['2018-11-10', '2017/18'],
    ['2018-11-11', '2018/19'],
    ['2019-02-28', '2018/19'],
    ['2000-11-11', '2000/01'],
    ['2026-09-11', '2025/26'],
    ['nicht hinterlegt', 'nicht hinterlegt'],
  ])('reads %s as the session %s', (isoDay, expected) => {
    expect(formatSinceSession(isoDay)).toBe(expected);
  });
});

describe('toMemberSinceLabel', () => {
  it.each<[MembershipState, string]>([
    ['active', 'Mitglied seit'],
    ['paused', 'Mitglied seit'],
    ['ended', 'Mitglied ab'],
    ['none', 'Mitglied ab'],
  ])('labels a %s chain with %s', (state, expected) => {
    expect(toMemberSinceLabel(state)).toBe(expected);
  });
});
