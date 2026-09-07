import { RequestBlockedError, UnauthorizedError } from '@/lib/api/api-error';

export type QueryErrorKind = 'unreachable' | 'unexpected';

export const toQueryErrorKind = (error: Error | null): QueryErrorKind | null => {
  if (error === null) {
    return null;
  }
  if (error instanceof UnauthorizedError) {
    return null;
  }
  if (error instanceof RequestBlockedError) {
    return 'unreachable';
  }
  return 'unexpected';
};
