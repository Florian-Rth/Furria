import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

export const BOOT_STATUS_MESSAGE = 'ZUGANG WIRD GEPRÜFT';

export const BOOT_FAILURE_MESSAGE =
  'Die Verbindung zum Server ist fehlgeschlagen. Deine Anmeldung bleibt erhalten.';

export const BOOT_RETRY_LABEL = 'Erneut versuchen';

export const BOOT_RELOGIN_LABEL = 'Neu anmelden';

export const CONNECTION_LOST_MESSAGE = 'Keine Verbindung';

export const CONNECTION_LOST_DETAIL =
  'Du bist offline. Speichern klappt erst wieder mit Verbindung – dann lädt die App von selbst weiter.';

export const NOTICE_DISMISS_LABEL = 'Schließen';

export const NOTICE_EXPAND_LABEL = 'Hinweis ausklappen';

export const NOTICE_COLLAPSE_LABEL = 'Hinweis einklappen';

export const SCREEN_FAILURE_BAR_TITLE = 'Da hakt es';

export const SCREEN_FAILURE_TITLE = 'SEITE NICHT VERFÜGBAR';

const SCREEN_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Keine Verbindung zum Server. Prüfe deine Internetverbindung und versuche es erneut.',
  unexpected: 'Die Seite konnte nicht angezeigt werden. Versuche es erneut.',
  rejected: 'Der Server hat die Anfrage für diese Seite abgelehnt.',
};

export const toScreenErrorMessage = (error: Error): string =>
  toQueryErrorMessage(error, SCREEN_ERROR_MESSAGES) ?? SCREEN_ERROR_MESSAGES.unexpected;

export const SCREEN_NOT_FOUND_BAR_TITLE = 'Nicht gefunden';

export const SCREEN_NOT_FOUND_TITLE = 'HIER IST NICHTS';

export const SCREEN_NOT_FOUND_DESCRIPTION = 'Diese Seite gibt es nicht.';

const APP_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Keine Verbindung zum Server. Prüfe deine Internetverbindung und versuche es erneut.',
  unexpected: 'Die Anfrage konnte nicht verarbeitet werden. Versuche es erneut.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toAppErrorMessage = (error: Error): string =>
  toQueryErrorMessage(error, APP_ERROR_MESSAGES) ?? APP_ERROR_MESSAGES.unexpected;

export const APP_NOT_FOUND_MESSAGE = 'Diese Seite gibt es nicht.';

export const APP_START_LABEL = 'Zum Start';

export const ME_FAILURE_TITLE = 'ACCOUNT NICHT GELADEN';

const ME_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Der Server ist nicht erreichbar. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Dein Account konnte nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toMeErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, ME_ERROR_MESSAGES);

export const SHELL_PROFILE_LABEL = 'Mein Profil';
