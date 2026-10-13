import { apiFailureOf } from '@furria/api-client';

export type MailRequestFailureKind = 'throttled' | 'unreachable' | 'timed-out' | 'unexpected';

const MAIL_REQUEST_FAILURE_MESSAGES: Record<MailRequestFailureKind, string> = {
  throttled:
    'Zu viele Anfragen für diese Adresse. Warte ein paar Minuten und versuche es dann erneut.',
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  'timed-out': 'Der Server antwortet gerade zu langsam. Versuche es gleich noch einmal.',
  unexpected: 'Das hat nicht funktioniert. Bitte versuche es erneut.',
};

export const toMailRequestFailureKind = (error: Error | null): MailRequestFailureKind | null => {
  if (error === null) {
    return null;
  }

  switch (apiFailureOf(error)?.kind) {
    case 'unreachable':
      return 'unreachable';
    case 'timedOut':
      return 'timed-out';
    case 'throttled':
      return 'throttled';
    default:
      return 'unexpected';
  }
};

export const toMailRequestFailureMessage = (error: Error | null): string | null => {
  const kind = toMailRequestFailureKind(error);

  return kind === null ? null : MAIL_REQUEST_FAILURE_MESSAGES[kind];
};
