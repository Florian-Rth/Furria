import { apiFailureOf, apiStatusOf, refusalMessageOf } from '@furria/api-client';
import { OfflineWriteError } from '@/lib/api/offline-write-error';

export type QueryErrorKind = 'unreachable' | 'unexpected' | 'rejected';

type SharedFailureKind = 'forbidden' | 'throttled' | 'timedOut';

export type QueryFailureKind = QueryErrorKind | SharedFailureKind;

const SHARED_FAILURE_MESSAGES: Record<SharedFailureKind, string> = {
  forbidden: 'Dafür fehlt dir die Berechtigung.',
  throttled: 'Gerade kommen zu viele Anfragen an. Warte einen Moment und versuche es erneut.',
  timedOut: 'Der Server antwortet gerade zu langsam. Versuche es gleich noch einmal.',
};

const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;

export const isNotFoundError = (error: Error | null): boolean =>
  apiStatusOf(error) === NOT_FOUND_STATUS;

export const isForbiddenError = (error: Error | null): boolean =>
  apiStatusOf(error) === FORBIDDEN_STATUS;

export const toQueryErrorKind = (error: Error | null): QueryFailureKind | null => {
  if (error === null) {
    return null;
  }
  if (error instanceof OfflineWriteError) {
    return 'unreachable';
  }
  if (isForbiddenError(error)) {
    return 'forbidden';
  }

  switch (apiFailureOf(error)?.kind) {
    case 'unauthorized':
      return null;
    case 'unreachable':
      return 'unreachable';
    case 'timedOut':
      return 'timedOut';
    case 'throttled':
      return 'throttled';
    case 'refused':
      return 'rejected';
    default:
      return 'unexpected';
  }
};

const isSharedFailure = (kind: QueryFailureKind): kind is SharedFailureKind =>
  kind === 'forbidden' || kind === 'throttled' || kind === 'timedOut';

export const toQueryErrorMessage = (
  error: Error | null,
  messages: Record<QueryErrorKind, string>,
): string | null => {
  const kind = toQueryErrorKind(error);

  if (kind === null) {
    return null;
  }
  if (isSharedFailure(kind)) {
    return SHARED_FAILURE_MESSAGES[kind];
  }

  return refusalMessageOf(error) ?? messages[kind];
};
