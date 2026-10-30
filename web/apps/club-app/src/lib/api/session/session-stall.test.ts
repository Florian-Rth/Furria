import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import type { SessionStall } from './session-stall';
import { sessionStallOf } from './session-stall';

describe('sessionStallOf', () => {
  it.each<[string, Error | null, SessionStall]>([
    ['a rate-limited refresh', new ApiError({ kind: 'throttled' }), 'throttled'],
    ['an unreachable server', new ApiError({ kind: 'unreachable' }), 'unreachable'],
    ['a timed-out refresh', new ApiError({ kind: 'timedOut' }), 'unreachable'],
    ['a server failure', new ApiError({ kind: 'status', status: 503 }), 'unreachable'],
    ['an error from outside the API', new Error('boom'), 'unreachable'],
    ['nothing at all', null, 'unreachable'],
  ])('reads %s as %s', (_case, error, expected) => {
    expect(sessionStallOf(error)).toBe(expected);
  });
});
