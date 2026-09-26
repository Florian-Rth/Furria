import { describe, expect, it } from 'vitest';
import { RequestBlockedError, RequestFailedError, UnauthorizedError } from '@/lib/api/api-error';
import { toPasskeyFailureKind } from './passkey-failure';

describe('toPasskeyFailureKind', () => {
  it.each([
    { error: new DOMException('cancelled', 'NotAllowedError'), kind: 'cancelled' },
    { error: new DOMException('aborted', 'AbortError'), kind: 'cancelled' },
    { error: new DOMException('excluded', 'InvalidStateError'), kind: 'already-on-device' },
    { error: new DOMException('insecure', 'SecurityError'), kind: 'unexpected' },
    { error: new UnauthorizedError(), kind: 'rejected' },
    { error: new RequestFailedError(400, []), kind: 'refused' },
    { error: new RequestBlockedError(), kind: 'unreachable' },
    { error: new Error('boom'), kind: 'unexpected' },
  ])('reads $error.name as $kind', ({ error, kind }) => {
    expect(toPasskeyFailureKind(error)).toBe(kind);
  });
});
