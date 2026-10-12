import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { toResetErrorMessages } from './reset-messages';

type Slot = 'none' | 'password' | 'footer';

const slotOf = (error: Error | null): Slot => {
  const messages = toResetErrorMessages(error);
  if (messages.password !== null) {
    return 'password';
  }

  return messages.footer === null ? 'none' : 'footer';
};

describe('toResetErrorMessages', () => {
  it.each<[string, Error | null, Slot]>([
    ['no error', null, 'none'],
    [
      'a dead reset link, which the screen shows instead of the form',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'reset', message: 'gilt nicht mehr' }],
      }),
      'none',
    ],
    [
      'a refused password',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'password', message: 'zu kurz' }],
      }),
      'password',
    ],
    ['a throttled reset link', new ApiError({ kind: 'throttled' }), 'footer'],
  ])('places %s', (_case, error, expected) => {
    expect(slotOf(error)).toBe(expected);
  });

  it('carries the server message for a refused password', () => {
    const refusal = new ApiError({
      kind: 'refused',
      status: 400,
      fields: [{ field: 'password', message: 'Regel verletzt' }],
    });

    expect(toResetErrorMessages(refusal).password).toBe('Regel verletzt');
  });
});
