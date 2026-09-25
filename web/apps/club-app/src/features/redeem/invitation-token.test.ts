import { describe, expect, it } from 'vitest';
import { readInvitationToken } from './invitation-token';

describe('readInvitationToken', () => {
  it.each<[string, string, string | null]>([
    ['a fragment with its mark', '#token=aB3-_x9Q', 'aB3-_x9Q'],
    ['a fragment without its mark', 'token=aB3-_x9Q', 'aB3-_x9Q'],
    ['a token beside other parameters', '#utm=mail&token=aB3', 'aB3'],
    ['an empty fragment', '', null],
    ['a lone mark', '#', null],
    ['an empty token', '#token=', null],
    ['a token of blanks', '#token=%20%20', null],
    ['a token with foreign characters', '#token=ab%2Fcd', null],
    ['a fragment without a token', '#other=aB3', null],
  ])('reads %s', (_case, fragment, expected) => {
    expect(readInvitationToken(fragment)).toBe(expected);
  });
});
