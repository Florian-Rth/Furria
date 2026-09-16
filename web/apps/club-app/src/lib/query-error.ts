import {
  RequestBlockedError,
  RequestFailedError,
  ServerFailureError,
  UnauthorizedError,
} from '@/lib/api/api-error';

export type QueryErrorKind = 'unreachable' | 'unexpected' | 'rejected';

const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;

export const isNotFoundError = (error: Error | null): boolean =>
  error instanceof ServerFailureError && error.status === NOT_FOUND_STATUS;

export const isForbiddenError = (error: Error | null): boolean =>
  error instanceof ServerFailureError && error.status === FORBIDDEN_STATUS;

export const toQueryErrorKind = (error: Error | null): QueryErrorKind | null => {
  if (error === null) {
    return null;
  }
  if (error instanceof UnauthorizedError) {
    return null;
  }
  if (error instanceof ServerFailureError && error.status === FORBIDDEN_STATUS) {
    return null;
  }
  if (error instanceof RequestBlockedError) {
    return 'unreachable';
  }
  if (error instanceof RequestFailedError) {
    return 'rejected';
  }
  return 'unexpected';
};

export const toQueryErrorMessage = (
  error: Error | null,
  messages: Record<QueryErrorKind, string>,
): string | null => {
  const kind = toQueryErrorKind(error);

  if (kind === null) {
    return null;
  }
  if (error instanceof RequestFailedError) {
    return error.firstMessage;
  }

  return messages[kind];
};
