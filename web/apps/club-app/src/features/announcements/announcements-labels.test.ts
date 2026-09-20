import { describe, expect, it } from 'vitest';
import { toAnnouncementsLead, toValidUntilLabel } from './announcements-labels';

describe('toValidUntilLabel', () => {
  it.each([
    { validUntil: null, expected: null },
    { validUntil: '2026-09-20', expected: 'Gültig bis 20.09.2026' },
    { validUntil: '2027-01-05', expected: 'Gültig bis 05.01.2027' },
  ])('turns $validUntil into $expected', ({ validUntil, expected }) => {
    expect(toValidUntilLabel(validUntil)).toBe(expected);
  });
});

describe('toAnnouncementsLead', () => {
  it.each([
    { count: 0, expected: '0 Aushänge' },
    { count: 1, expected: '1 Aushang' },
    { count: 2, expected: '2 Aushänge' },
    { count: 17, expected: '17 Aushänge' },
  ])('counts $count as "$expected"', ({ count, expected }) => {
    expect(toAnnouncementsLead(count)).toBe(expected);
  });
});
