import { RequestBlockedError, RequestFailedError, ServerFailureError } from '@/lib/api/api-error';
import { toCamelCaseField } from '@/lib/api/api-failures';

export type ResetFailureKind = 'dead' | 'password' | 'throttled' | 'unreachable' | 'unexpected';

const TOO_MANY_REQUESTS_STATUS = 429;
const PASSWORD_FIELD = 'password';

const refusesPassword = (error: RequestFailedError): boolean =>
  error.failures.some((failure) => toCamelCaseField(failure.field) === PASSWORD_FIELD);

export const toResetFailureKind = (error: Error | null): ResetFailureKind | null => {
  if (error === null) {
    return null;
  }
  if (error instanceof RequestBlockedError) {
    return 'unreachable';
  }
  if (error instanceof RequestFailedError) {
    return refusesPassword(error) ? 'password' : 'dead';
  }
  if (error instanceof ServerFailureError && error.status === TOO_MANY_REQUESTS_STATUS) {
    return 'throttled';
  }

  return 'unexpected';
};
