import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { SessionPersistenceError } from '@/lib/api/session/session-error';
import { toPasskeyFailureKind } from './passkey-failure';

describe('toPasskeyFailureKind', () => {
  it.each([
    { error: new DOMException('aborted', 'AbortError'), kind: 'cancelled' },
    { error: new DOMException('dismissed or timed out', 'NotAllowedError'), kind: 'dismissed' },
    { error: new DOMException('excluded', 'InvalidStateError'), kind: 'already-on-device' },
    { error: new DOMException('insecure', 'SecurityError'), kind: 'unexpected' },
    { error: new ApiError({ kind: 'unauthorized' }), kind: 'rejected' },
    { error: new ApiError({ kind: 'refused', status: 400, fields: [] }), kind: 'refused' },
    { error: new ApiError({ kind: 'unreachable' }), kind: 'unreachable' },
    { error: new ApiError({ kind: 'timedOut' }), kind: 'timed-out' },
    { error: new ApiError({ kind: 'throttled' }), kind: 'throttled' },
    { error: new ApiError({ kind: 'status', status: 500 }), kind: 'unexpected' },
    { error: new SessionPersistenceError(), kind: 'session-not-kept' },
  ])('reads $error.name as $kind', ({ error, kind }) => {
    expect(toPasskeyFailureKind(error)).toBe(kind);
  });
});
