import { describe, expect, it } from 'vitest';
import { RequestBlockedError, ServerFailureError, UnauthorizedError } from '@/lib/api/api-error';
import { toWriteErrorMessage } from './write-error';

describe('toWriteErrorMessage', () => {
  it('tells a write whose row someone else removed apart from a write that simply failed', () => {
    expect(toWriteErrorMessage(new ServerFailureError(404))).not.toBe(
      toWriteErrorMessage(new ServerFailureError(500)),
    );
  });

  it('answers a lost row instead of staying silent', () => {
    expect(toWriteErrorMessage(new ServerFailureError(404))).not.toBeNull();
  });

  it.each<[string, Error | null, boolean]>([
    ['nothing went wrong', null, false],
    ['a guard is about to answer the 403', new ServerFailureError(403), false],
    ['the session layer already handled the 401', new UnauthorizedError(), false],
    ['the request never left the device', new RequestBlockedError(), true],
  ])('renders an error when %s: %s', (_case, error, expected) => {
    expect(toWriteErrorMessage(error) !== null).toBe(expected);
  });
});
