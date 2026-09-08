import { RequestBlockedError, UnauthorizedError } from '@/lib/api/api-error';

export type LoginErrorKind = 'invalid-credentials' | 'unreachable' | 'unexpected';

export const toLoginErrorKind = (error: Error | null): LoginErrorKind | null => {
  if (error === null) {
    return null;
  }
  if (error instanceof UnauthorizedError) {
    return 'invalid-credentials';
  }
  if (error instanceof RequestBlockedError) {
    return 'unreachable';
  }
  return 'unexpected';
};
