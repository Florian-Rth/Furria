import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { unlockFailureKindOf, WrongPasswordError } from './unlock-failure';

describe('unlockFailureKindOf', () => {
  it.each([
    ['no error', null, null],
    ['a rejected password', new WrongPasswordError(), 'wrongPassword'],
    ['a blocked request', new ApiError({ kind: 'unreachable' }), 'blocked'],
    ['any other failure', new Error('boom'), 'unexpected'],
  ])('classifies %s', (_, error, kind) => {
    expect(unlockFailureKindOf(error)).toBe(kind);
  });
});
