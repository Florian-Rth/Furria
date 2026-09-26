import { describe, expect, it } from 'vitest';
import { isCompleteInvitationCode, normalizeInvitationCode } from './invitation-code';

describe('normalizeInvitationCode', () => {
  it.each<[string, string, string]>([
    ['lower case with a blank', 'k7m4 q2xp', 'K7M4-Q2XP'],
    ['the displayed form', 'K7M4-Q2XP', 'K7M4-Q2XP'],
    ['no separator at all', 'k7m4q2xp', 'K7M4-Q2XP'],
    ['stray blanks and dashes', ' k7-m4  q2–xp ', 'K7M4-Q2XP'],
    ['the first group only', 'k7m4', 'K7M4'],
    ['a started second group', 'k7m4q', 'K7M4-Q'],
    ['a first group typed with its dash', 'K7M4-', 'K7M4'],
    ['too many characters', 'k7m4q2xpzz', 'K7M4-Q2XP'],
    ['nothing', '', ''],
  ])('normalises %s', (_case, typed, expected) => {
    expect(normalizeInvitationCode(typed)).toBe(expected);
  });
});

describe('isCompleteInvitationCode', () => {
  it.each<[string, string, boolean]>([
    ['a whole code', 'K7M4-Q2XP', true],
    ['half a code', 'K7M4-Q2', false],
    ['a code with an O', 'K7M4-Q2XO', false],
    ['a code with a zero', 'K7M4-Q2X0', false],
    ['a code with an I', 'K7M4-Q2XI', false],
    ['a code with an L', 'K7M4-Q2XL', false],
    ['a code with a one', 'K7M4-Q2X1', false],
    ['a code without its dash', 'K7M4Q2XP', false],
  ])('judges %s', (_case, code, expected) => {
    expect(isCompleteInvitationCode(code)).toBe(expected);
  });
});
