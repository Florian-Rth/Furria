import { describe, expect, it } from 'vitest';
import {
  CODE_EXPIRED_LINE,
  formatPasskeyDay,
  toCodeValidityLine,
  toLoginEmailSavedMessage,
} from './account-security-labels';

describe('toLoginEmailSavedMessage', () => {
  it.each([
    [
      'a contact email that followed',
      true,
      'Du meldest dich jetzt mit anna@web.de an. Deine Kontakt-E-Mail ist ebenfalls geändert.',
    ],
    [
      'a contact email she kept',
      false,
      'Du meldest dich jetzt mit anna@web.de an. Deine Kontakt-E-Mail ist unverändert.',
    ],
  ])('formats the notice for %s', (_case, contactEmailFollowed, expected) => {
    expect(toLoginEmailSavedMessage('anna@web.de', contactEmailFollowed)).toBe(expected);
  });
});

describe('toCodeValidityLine', () => {
  it.each([
    ['a fresh code', 900, 'Der Code gilt noch 15:00.'],
    ['a code in its last seconds', 9, 'Der Code gilt noch 0:09.'],
    ['an expired code', 0, CODE_EXPIRED_LINE],
  ])('formats %s', (_case, secondsLeft, expected) => {
    expect(toCodeValidityLine(secondsLeft)).toBe(expected);
  });
});

describe('formatPasskeyDay', () => {
  it.each([
    ['a passkey added this year', '2026-10-03T09:30:00+02:00', '3. Okt.'],
    ['a passkey added in an earlier year', '2025-03-14T12:00:00+01:00', '14. März 2025'],
  ])('formats %s', (_case, addedAt, expected) => {
    expect(formatPasskeyDay(addedAt, new Date(2026, 11, 1))).toBe(expected);
  });
});
