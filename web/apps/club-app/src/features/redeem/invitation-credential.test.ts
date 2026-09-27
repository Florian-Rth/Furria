import { describe, expect, it } from 'vitest';
import type { InvitationCredential } from './invitation-credential';
import {
  readInvitationCredential,
  toCodeFragment,
  toCredentialBody,
  toCredentialKey,
} from './invitation-credential';

describe('readInvitationCredential', () => {
  it.each<[string, string, InvitationCredential | null]>([
    ['a link token', '#token=aB3-_x9Q', { kind: 'token', token: 'aB3-_x9Q' }],
    ['a whole code', '#code=K7M4-Q2XP', { kind: 'code', code: 'K7M4-Q2XP' }],
    ['a loosely typed code', '#code=k7m4q2xp', { kind: 'code', code: 'K7M4-Q2XP' }],
    ['a token beside a code', '#token=aB3&code=K7M4-Q2XP', { kind: 'token', token: 'aB3' }],
    ['half a code', '#code=K7M4', null],
    ['a code with ambiguous letters', '#code=OOOO-IIII', null],
    ['an empty fragment', '', null],
  ])('reads %s', (_case, fragment, expected) => {
    expect(readInvitationCredential(fragment)).toEqual(expected);
  });
});

describe('toCredentialBody', () => {
  it.each<[string, InvitationCredential, Record<string, string>]>([
    ['a token', { kind: 'token', token: 'abc' }, { token: 'abc' }],
    ['a code', { kind: 'code', code: 'K7M4-Q2XP' }, { code: 'K7M4-Q2XP' }],
  ])('sends %s under its own name', (_case, credential, expected) => {
    expect(toCredentialBody(credential)).toEqual(expected);
  });
});

describe('toCredentialKey', () => {
  it.each<[string, InvitationCredential | null, string | null]>([
    ['no credential', null, null],
    ['a token', { kind: 'token', token: 'abc' }, 'token:abc'],
    ['a code', { kind: 'code', code: 'K7M4-Q2XP' }, 'code:K7M4-Q2XP'],
  ])('keys %s', (_case, credential, expected) => {
    expect(toCredentialKey(credential)).toBe(expected);
  });
});

describe('toCodeFragment', () => {
  it('carries the code so readInvitationCredential reads it back', () => {
    expect(readInvitationCredential(`#${toCodeFragment('K7M4-Q2XP')}`)).toEqual({
      kind: 'code',
      code: 'K7M4-Q2XP',
    });
  });
});
