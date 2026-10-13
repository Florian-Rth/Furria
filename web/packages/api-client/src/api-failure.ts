export interface ApiFieldFailure {
  field: string;
  message: string;
}

export type RefusalStatus = 400 | 409 | 422;

export interface Refusal {
  kind: 'refused';
  status: RefusalStatus;
  fields: readonly ApiFieldFailure[];
}

export type ApiFailure =
  | { kind: 'unreachable' }
  | { kind: 'timedOut' }
  | { kind: 'unauthorized' }
  | { kind: 'throttled' }
  | Refusal
  | { kind: 'status'; status: number }
  | { kind: 'mismatch' };

export type ApiFailureKind = ApiFailure['kind'];

export class ApiError extends Error {
  readonly failure: ApiFailure;

  constructor(failure: ApiFailure) {
    super(`The API request failed: ${failure.kind}.`);
    this.name = 'ApiError';
    this.failure = failure;
  }
}

const UNAUTHORIZED_STATUS = 401;
const TOO_MANY_REQUESTS_STATUS = 429;
const REFUSAL_STATUSES: readonly number[] = [400, 409, 422];

export const isUnauthorizedStatus = (status: number): boolean => status === UNAUTHORIZED_STATUS;

export const isRefusalStatus = (status: number): status is RefusalStatus =>
  REFUSAL_STATUSES.includes(status);

export const failureOfStatus = (
  status: number,
  fields: readonly ApiFieldFailure[] | null,
): ApiFailure => {
  if (isUnauthorizedStatus(status)) {
    return { kind: 'unauthorized' };
  }
  if (status === TOO_MANY_REQUESTS_STATUS) {
    return { kind: 'throttled' };
  }
  if (isRefusalStatus(status) && fields !== null) {
    return { kind: 'refused', status, fields };
  }

  return { kind: 'status', status };
};

export const apiFailureOf = (error: Error | null): ApiFailure | null =>
  error instanceof ApiError ? error.failure : null;

export const refusalOf = (error: Error | null): Refusal | null => {
  const failure = apiFailureOf(error);

  return failure?.kind === 'refused' ? failure : null;
};

export const refusalMessageOf = (error: Error | null): string | null =>
  refusalOf(error)?.fields[0]?.message ?? null;

export const apiStatusOf = (error: Error | null): number | null => {
  const failure = apiFailureOf(error);

  switch (failure?.kind) {
    case 'unauthorized':
      return UNAUTHORIZED_STATUS;
    case 'throttled':
      return TOO_MANY_REQUESTS_STATUS;
    case 'refused':
    case 'status':
      return failure.status;
    default:
      return null;
  }
};

const SERVER_FAILURE_FLOOR = 500;
const MAX_RETRY_ATTEMPTS = 1;

const isTransient = (error: Error): boolean => {
  const failure = apiFailureOf(error);

  if (failure?.kind === 'unreachable' || failure?.kind === 'timedOut') {
    return true;
  }

  return failure?.kind === 'status' && failure.status >= SERVER_FAILURE_FLOOR;
};

export const shouldRetryRequest = (failureCount: number, error: Error): boolean =>
  failureCount < MAX_RETRY_ATTEMPTS && isTransient(error);
