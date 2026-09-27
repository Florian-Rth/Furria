import { describe, expect, it } from 'vitest';
import { RequestBlockedError, RequestFailedError, ServerFailureError } from '@/lib/api/api-error';
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
      new RequestFailedError(400, [{ field: 'reset', message: 'gilt nicht mehr' }]),
      'none',
    ],
    [
      'a refused password',
      new RequestFailedError(400, [{ field: 'password', message: 'zu kurz' }]),
      'password',
    ],
    ['a throttled reset link', new ServerFailureError(429), 'footer'],
    ['a blocked request', new RequestBlockedError(), 'footer'],
  ])('places %s', (_case, error, expected) => {
    expect(slotOf(error)).toBe(expected);
  });

  it('carries the server message for a refused password', () => {
    const refusal = new RequestFailedError(400, [{ field: 'password', message: 'Regel verletzt' }]);

    expect(toResetErrorMessages(refusal).password).toBe(refusal.firstMessage);
  });
});
