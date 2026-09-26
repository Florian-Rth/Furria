import { describe, expect, it } from 'vitest';
import { RequestBlockedError, RequestFailedError, ServerFailureError } from '@/lib/api/api-error';
import type { MailRequestFailureKind } from './mail-request-failure';
import { toMailRequestFailureKind } from './mail-request-failure';

describe('toMailRequestFailureKind', () => {
  it.each<[string, Error | null, MailRequestFailureKind | null]>([
    ['no error', null, null],
    ['a blocked request', new RequestBlockedError(), 'unreachable'],
    ['a throttled address', new ServerFailureError(429), 'throttled'],
    ['a server failure', new ServerFailureError(500), 'unexpected'],
    [
      'a refused address',
      new RequestFailedError(400, [{ field: 'email', message: 'ungültig' }]),
      'unexpected',
    ],
  ])('classifies %s', (_case, error, expected) => {
    expect(toMailRequestFailureKind(error)).toBe(expected);
  });
});
