import type { SessionFarewell } from '@/lib/api/session/session-store';
import type { LoginErrorKind } from '@/lib/login-error';
import { toLoginErrorKind } from '@/lib/login-error';

export const SESSION_EXPIRED_MESSAGE = 'Deine Sitzung ist abgelaufen. Bitte melde dich neu an.';

export const FAREWELL_MESSAGES: Record<SessionFarewell, string> = {
  'account-deleted':
    'Dein Account ist gelöscht. Deine Vereinsdaten bleiben beim Verein – wende dich an ihn, wenn du wieder einen Zugang möchtest.',
  'person-erased':
    'Du bist gelöscht – mit allem, was der Verein über dich festgehalten hat, auch deinem Account. Eine Bestätigung kommt per E-Mail.',
};

export const PASSWORD_RESET_NOTICE =
  'Dein neues Passwort ist gespeichert. Melde dich jetzt damit an.';

const LOGIN_ERROR_MESSAGES: Record<LoginErrorKind, string> = {
  'invalid-credentials': 'E-Mail-Adresse oder Passwort ist falsch.',
  throttled:
    'Zu viele fehlgeschlagene Anmeldungen aus diesem Netz. Warte ein paar Minuten und versuche es dann erneut.',
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.',
};

export const toLoginErrorMessage = (error: Error | null): string | null => {
  const kind = toLoginErrorKind(error);

  if (kind === null) {
    return null;
  }

  return LOGIN_ERROR_MESSAGES[kind];
};
