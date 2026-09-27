import { RequestBlockedError, ServerFailureError } from '@/lib/api/api-error';

export type MailRequestFailureKind = 'throttled' | 'unreachable' | 'unexpected';

const TOO_MANY_REQUESTS_STATUS = 429;

const MAIL_REQUEST_FAILURE_MESSAGES: Record<MailRequestFailureKind, string> = {
  throttled:
    'Zu viele Anfragen für diese Adresse. Warte ein paar Minuten und versuche es dann erneut.',
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Das hat nicht funktioniert. Bitte versuche es erneut.',
};

export const toMailRequestFailureKind = (error: Error | null): MailRequestFailureKind | null => {
  if (error === null) {
    return null;
  }
  if (error instanceof RequestBlockedError) {
    return 'unreachable';
  }
  if (error instanceof ServerFailureError && error.status === TOO_MANY_REQUESTS_STATUS) {
    return 'throttled';
  }

  return 'unexpected';
};

export const toMailRequestFailureMessage = (error: Error | null): string | null => {
  const kind = toMailRequestFailureKind(error);

  return kind === null ? null : MAIL_REQUEST_FAILURE_MESSAGES[kind];
};
