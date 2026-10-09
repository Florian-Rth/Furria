import { apiFailureOf, apiStatusOf, refusalMessageOf } from '@furria/api-client';

export type QueryErrorKind = 'unreachable' | 'unexpected' | 'rejected';

const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;

export const isNotFoundError = (error: Error | null): boolean =>
  apiStatusOf(error) === NOT_FOUND_STATUS;

export const isForbiddenError = (error: Error | null): boolean =>
  apiStatusOf(error) === FORBIDDEN_STATUS;

export const toQueryErrorKind = (error: Error | null): QueryErrorKind | null => {
  if (error === null || isForbiddenError(error)) {
    return null;
  }

  switch (apiFailureOf(error)?.kind) {
    case 'unauthorized':
      return null;
    case 'unreachable':
      return 'unreachable';
    case 'refused':
      return 'rejected';
    default:
      return 'unexpected';
  }
};

export const toQueryErrorMessage = (
  error: Error | null,
  messages: Record<QueryErrorKind, string>,
): string | null => {
  const kind = toQueryErrorKind(error);

  return kind === null ? null : (refusalMessageOf(error) ?? messages[kind]);
};
