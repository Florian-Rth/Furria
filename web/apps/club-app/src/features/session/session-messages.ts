import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

export const BOOT_STATUS_MESSAGE = 'ZUGANG WIRD GEPRÜFT';

export const BOOT_FAILURE_MESSAGE =
  'Die Verbindung zum Server ist fehlgeschlagen. Deine Anmeldung bleibt erhalten.';

export const BOOT_RETRY_LABEL = 'Erneut versuchen';

export const CONNECTION_LOST_MESSAGE = 'Keine Verbindung';

export const CONNECTION_LOST_DETAIL =
  'Du bist offline. Die App lädt weiter, sobald die Verbindung wiederhergestellt ist.';

export const NOTICE_DISMISS_LABEL = 'Schließen';

export const NOTICE_EXPAND_LABEL = 'Hinweis ausklappen';

export const NOTICE_COLLAPSE_LABEL = 'Hinweis einklappen';

export const SCREEN_FAILURE_BAR_TITLE = 'Da hakt es';

export const SCREEN_FAILURE_TITLE = 'SEITE NICHT VERFÜGBAR';

export const SCREEN_FAILURE_DESCRIPTION =
  'Die Seite konnte nicht angezeigt werden. Versuche es erneut.';

export const SCREEN_NOT_FOUND_BAR_TITLE = 'Nicht gefunden';

export const SCREEN_NOT_FOUND_TITLE = 'HIER IST NICHTS';

export const SCREEN_NOT_FOUND_DESCRIPTION = 'Diese Seite gibt es nicht.';

export const APP_FAILURE_MESSAGE =
  'Die Anfrage konnte nicht verarbeitet werden. Versuche es erneut.';

export const APP_NOT_FOUND_MESSAGE = 'Diese Seite gibt es nicht.';

export const APP_START_LABEL = 'Zur Übersicht';

export const ME_FAILURE_TITLE = 'KONTO NICHT GELADEN';

const ME_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Dein Konto hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Dein Konto konnte nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toMeErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, ME_ERROR_MESSAGES);
