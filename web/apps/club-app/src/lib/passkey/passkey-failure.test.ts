import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { toPasskeyFailureKind } from './passkey-failure';

describe('toPasskeyFailureKind', () => {
  it.each([
    { error: new DOMException('cancelled', 'NotAllowedError'), kind: 'cancelled' },
    { error: new DOMException('excluded', 'InvalidStateError'), kind: 'already-on-device' },
    { error: new DOMException('insecure', 'SecurityError'), kind: 'unexpected' },
    { error: new ApiError({ kind: 'unauthorized' }), kind: 'rejected' },
    { error: new ApiError({ kind: 'refused', status: 400, fields: [] }), kind: 'refused' },
    { error: new ApiError({ kind: 'unreachable' }), kind: 'unreachable' },
    { error: new ApiError({ kind: 'timedOut' }), kind: 'timed-out' },
    { error: new ApiError({ kind: 'throttled' }), kind: 'throttled' },
    { error: new ApiError({ kind: 'status', status: 500 }), kind: 'unexpected' },
  ])('reads $error.name as $kind', ({ error, kind }) => {
    expect(toPasskeyFailureKind(error)).toBe(kind);
  });
});
