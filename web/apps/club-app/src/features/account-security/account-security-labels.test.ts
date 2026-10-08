import { describe, expect, it } from 'vitest';
import { formatPasskeyDay } from './account-security-labels';

describe('formatPasskeyDay', () => {
  it.each([
    ['a passkey added this year', '2026-10-03T09:30:00+02:00', '3. Okt.'],
    ['a passkey added in an earlier year', '2025-03-14T12:00:00+01:00', '14. März 2025'],
  ])('formats %s', (_case, addedAt, expected) => {
    expect(formatPasskeyDay(addedAt, new Date(2026, 11, 1))).toBe(expected);
  });
});
