import { describe, expect, it } from 'vitest';
import { readInvitationToken } from './invitation-token';

describe('readInvitationToken', () => {
  it.each<[string, string, string | null]>([
    ['a fragment with its mark', '#token=aB3-_x9Q', 'aB3-_x9Q'],
    ['a token with foreign characters', '#token=ab%2Fcd', null],
  ])('reads %s', (_case, fragment, expected) => {
    expect(readInvitationToken(fragment)).toBe(expected);
  });
});
