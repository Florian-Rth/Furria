import { describe, expect, it } from 'vitest';
import { RequestBlockedError } from '@/lib/api/errors';
import { unlockFailureKindOf, WrongPasswordError } from './unlock-failure';

describe('unlockFailureKindOf', () => {
  it.each([
    ['no error', null, null],
    ['a rejected password', new WrongPasswordError(), 'wrongPassword'],
    ['a blocked request', new RequestBlockedError(), 'blocked'],
    ['any other failure', new Error('boom'), 'unexpected'],
  ])('classifies %s', (_, error, kind) => {
    expect(unlockFailureKindOf(error)).toBe(kind);
  });
});
