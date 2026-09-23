import { describe, expect, it } from 'vitest';
import { toAnnouncementIdParam, toValidUntilLabel } from './announcements-labels';

describe('toValidUntilLabel', () => {
  it.each([
    { validUntil: null, expected: null },
    { validUntil: '2026-09-20', expected: 'Gültig bis 20.09.2026' },
    { validUntil: '2027-01-05', expected: 'Gültig bis 05.01.2027' },
  ])('turns $validUntil into $expected', ({ validUntil, expected }) => {
    expect(toValidUntilLabel(validUntil)).toBe(expected);
  });
});

describe('toAnnouncementIdParam', () => {
  it.each([
    ['11', 11],
    ['0', null],
    ['-3', null],
    ['abc', null],
  ])('reads %s as %s', (raw, expected) => {
    expect(toAnnouncementIdParam(raw)).toBe(expected);
  });
});
