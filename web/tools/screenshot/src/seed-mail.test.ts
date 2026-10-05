import { describe, expect, it } from 'vitest';
import { invitationTokenOf, mailSentSince } from './seed-mail.ts';

describe('mailSentSince', () => {
  const messages = [
    { ID: 'new', Created: '2026-10-02T14:36:26.325Z' },
    { ID: 'old', Created: '2026-10-01T09:00:00Z' },
  ];

  it.each([
    ['2026-10-02T14:36:20.000Z', 'new'],
    ['2026-10-02T14:36:28.000Z', 'new'],
    ['2026-10-02T14:36:29.000Z', null],
    ['2026-09-30T00:00:00.000Z', 'new'],
  ])('after %s finds %s', (sentAfter, expected) => {
    expect(mailSentSince(messages, new Date(sentAfter))?.ID ?? null).toBe(expected);
  });
});

describe('invitationTokenOf', () => {
  it.each([
    [
      'Über diesen Link legst du dein Passwort fest:\nhttp://localhost:3001/invitation#token=Ab-9_xY',
      'Ab-9_xY',
    ],
    ['<a href="http://localhost:3001/invitation#token=Zz12">Zugang</a>', 'Zz12'],
    ['Hallo Sophie, der Link fehlt.', null],
  ])('reads the token from %j', (text, expected) => {
    expect(invitationTokenOf(text)).toBe(expected);
  });
});
