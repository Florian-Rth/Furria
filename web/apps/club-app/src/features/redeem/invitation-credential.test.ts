import { describe, expect, it } from 'vitest';
import type { InvitationCredential } from './invitation-credential';
import { readInvitationCredential } from './invitation-credential';

describe('readInvitationCredential', () => {
  it.each<[string, string, InvitationCredential | null]>([
    ['a link token', '#token=aB3-_x9Q', { kind: 'token', token: 'aB3-_x9Q' }],
    ['a loosely typed code', '#code=k7m4q2xp', { kind: 'code', code: 'K7M4-Q2XP' }],
    ['a token beside a code', '#token=aB3&code=K7M4-Q2XP', { kind: 'token', token: 'aB3' }],
    ['half a code', '#code=K7M4', null],
  ])('reads %s', (_case, fragment, expected) => {
    expect(readInvitationCredential(fragment)).toEqual(expected);
  });
});
