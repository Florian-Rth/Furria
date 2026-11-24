import { describe, expect, it } from 'vitest';
import { isCompleteInvitationCode, normalizeInvitationCode } from './invitation-code';

describe('normalizeInvitationCode', () => {
  it.each<[string, string, string]>([
    ['stray blanks and dashes', ' k7-m4  q2–xp ', 'K7M4-Q2XP'],
    ['too many characters', 'k7m4q2xpzz', 'K7M4-Q2XP'],
  ])('normalises %s', (_case, typed, expected) => {
    expect(normalizeInvitationCode(typed)).toBe(expected);
  });
});

describe('isCompleteInvitationCode', () => {
  it.each<[string, string, boolean]>([
    ['a whole code', 'K7M4-Q2XP', true],
    ['a code with an O', 'K7M4-Q2XO', false],
  ])('judges %s', (_case, code, expected) => {
    expect(isCompleteInvitationCode(code)).toBe(expected);
  });
});
