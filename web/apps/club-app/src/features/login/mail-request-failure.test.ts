import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import type { MailRequestFailureKind } from './mail-request-failure';
import { toMailRequestFailureKind } from './mail-request-failure';

describe('toMailRequestFailureKind', () => {
  it.each<[string, Error | null, MailRequestFailureKind | null]>([
    ['no error', null, null],
    ['a blocked request', new ApiError({ kind: 'unreachable' }), 'unreachable'],
    ['a server that answered too slowly', new ApiError({ kind: 'timedOut' }), 'timed-out'],
    ['a throttled address', new ApiError({ kind: 'throttled' }), 'throttled'],
    ['a server failure', new ApiError({ kind: 'status', status: 500 }), 'unexpected'],
  ])('classifies %s', (_case, error, expected) => {
    expect(toMailRequestFailureKind(error)).toBe(expected);
  });
});
