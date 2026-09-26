import type { LoginErrorKind } from '@/lib/login-error';
import { toLoginErrorKind } from '@/lib/login-error';

export const SESSION_EXPIRED_MESSAGE = 'Deine Sitzung ist abgelaufen. Bitte melde dich neu an.';

export const ACCOUNT_DELETED_MESSAGE =
  'Dein Account ist gelöscht. Deine Vereinsdaten bleiben beim Verein – wende dich an ihn, wenn du wieder einen Zugang möchtest.';

const LOGIN_ERROR_MESSAGES: Record<LoginErrorKind, string> = {
  'invalid-credentials': 'E-Mail-Adresse oder Passwort ist falsch.',
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
