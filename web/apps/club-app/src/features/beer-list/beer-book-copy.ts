import type { QueryErrorKind } from '@/lib/query-error';
import { BEER_LIST_TITLE } from './beer-list-copy';
import { cratesLabel } from './booking/booking-copy';

export const potLine = (owner: string | null): string =>
  owner === null ? BEER_LIST_TITLE : `${BEER_LIST_TITLE} · ${owner}`;

export const SIGN_IN_TITLE = 'Anmelden';
export const SIGN_IN_TEXT =
  'Melde dich einmal an, dann buchst du hier deine Kisten. Dieser Browser merkt sich die Anmeldung.';

export const DECLARE_TITLE = 'An der Bierliste teilnehmen';
export const declareText = (owner: string | null): string =>
  owner === null
    ? 'Ich nehme an der Bierliste teil. Kisten, die ich buche, stehen auf meinem Namen, bis ich sie privat bezahlt habe. Der Verein ist daran nicht beteiligt.'
    : `Ich nehme an der Bierliste von ${owner} teil. Kisten, die ich buche, stehen auf meinem Namen, bis ich sie ${owner} privat bezahlt habe. Der Verein ist daran nicht beteiligt.`;
export const DECLARE_CONFIRM = 'Ich nehme teil';

export const UNAFFILIATED_TITLE = 'Nur für den Verein';
export const UNAFFILIATED_TEXT =
  'Die Bierliste ist für Mitglieder, Gruppen und Ämter des Vereins. Zu deinem Zugang gehört gerade nichts davon, deshalb kannst du hier keine Kisten buchen.';

export const NO_POT_TITLE = 'Gerade keine Bierliste offen';
export const NO_POT_TEXT =
  'Buchen geht wieder, sobald eine Bierliste läuft. Sag dem Getränkewart Bescheid.';

export const DONE_TITLE = 'Fertig';
export const doneDetail = (count: number, openTotal: string): string =>
  `${cratesLabel(count)} gebucht · offen jetzt ${openTotal}`;
export const BOOK_AGAIN = 'Noch eine buchen';

export const FAILED_TITLE = 'Die Bierliste konnte nicht geladen werden.';

export const BOOK_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server.',
  unexpected: 'Bitte versuche es gleich noch einmal.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const JOIN_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Du bist noch nicht dabei.',
  unexpected: 'Das hat nicht geklappt. Bitte versuche es erneut.',
  rejected: 'Der Server hat die Teilnahme abgelehnt.',
};
