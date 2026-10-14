import { apiFailureOf } from '@furria/api-client';
import { SessionPersistenceError } from '@/lib/api/session/session-error';

export type LoginErrorKind =
  | 'invalid-credentials'
  | 'throttled'
  | 'unreachable'
  | 'timed-out'
  | 'session-not-kept'
  | 'unexpected';

export const SESSION_NOT_KEPT_MESSAGE =
  'Die Anmeldung ließ sich auf diesem Gerät nicht speichern. Prüfe, ob der Browser Website-Daten erlaubt, und versuche es erneut.';

export const toLoginErrorKind = (error: Error | null): LoginErrorKind | null => {
  if (error === null) {
    return null;
  }
  if (error instanceof SessionPersistenceError) {
    return 'session-not-kept';
  }

  switch (apiFailureOf(error)?.kind) {
    case 'unauthorized':
      return 'invalid-credentials';
    case 'throttled':
      return 'throttled';
    case 'unreachable':
      return 'unreachable';
    case 'timedOut':
      return 'timed-out';
    default:
      return 'unexpected';
  }
};
