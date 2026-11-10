import type { WindowClaimAnswer } from './claim-screen-view';

export const CLAIM_WINDOW_TITLE = 'Anmeldefenster';
export const CLAIM_WINDOW_PATH = '/claim-window';

export const CLAIM_TITLE = 'ZUGANG EINRICHTEN';
export const CLAIM_INTRO =
  'Gib deinen Namen und dein Geburtsdatum so ein, wie sie beim Verein hinterlegt sind.';
export const CLAIM_SUBMIT_LABEL = 'Weiter';
export const FIRST_NAME_LABEL = 'Vorname';
export const LAST_NAME_LABEL = 'Nachname';
export const BIRTH_DATE_TITLE = 'Geburtsdatum';
export const DAY_LABEL = 'Tag';
export const MONTH_LABEL = 'Monat';
export const YEAR_LABEL = 'Jahr';

export const CLOSED_TITLE = 'ANMELDUNG GESCHLOSSEN';
export const CLOSED_LINE =
  'Den Zugang mit Name und Geburtsdatum gibt es nur zu bestimmten Zeiten. Hat der Verein deine E-Mail-Adresse, forderst du den Zugang damit an.';
export const REQUEST_ACCESS_LABEL = 'Zugang anfordern';
export const LOGIN_LABEL = 'Zur Anmeldung';
export const RETRY_LABEL = 'Angaben ändern';

export interface ClaimAnswerCopy {
  title: string;
  line: string;
}

export const CLAIM_ANSWERS: Record<WindowClaimAnswer, ClaimAnswerCopy> = {
  hasAccount: {
    title: 'ZUGANG BESTEHT BEREITS',
    line: 'Melde dich mit deiner E-Mail-Adresse an. Ist das Passwort weg, setzt du es bei der Anmeldung zurück.',
  },
  hasEmail: {
    title: 'ZUGANG PER MAIL',
    line: 'Der Verein hat bereits eine E-Mail-Adresse von dir. Fordere den Zugang damit an.',
  },
  underAge: {
    title: 'NOCH NICHT MÖGLICH',
    line: 'Die App gibt es ab dem Mindestalter des Vereins.',
  },
  notFound: {
    title: 'NICHT GEFUNDEN',
    line: 'Mit diesen Angaben finden wir dich nicht. Prüfe die Schreibweise oder sprich den Vorstand an.',
  },
};

export const CLAIM_FAILURES = {
  throttled: 'Zu viele Versuche. Warte eine Minute und versuche es dann erneut.',
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Das hat nicht funktioniert. Bitte versuche es erneut.',
} as const;

export const WINDOW_OPENED_NOTICE = 'Anmeldefenster geöffnet.';
export const WINDOW_CLOSED_NOTICE = 'Anmeldefenster geschlossen.';
export const WINDOW_OPEN_LABEL = 'Öffnen';
export const WINDOW_MOVE_LABEL = 'Ende ändern';
export const WINDOW_CLOSE_LABEL = 'Jetzt schließen';
export const WINDOW_STATE_TITLE = 'Status';
export const WINDOW_END_TITLE = 'Offen bis';
export const WINDOW_END_DAY_LABEL = 'Tag';
export const WINDOW_END_TIME_LABEL = 'Uhrzeit';
export const WINDOW_END_HINT = 'Höchstens sieben Tage. Danach schließt das Fenster von selbst.';
export const WINDOW_ADDRESS_TITLE = 'Adresse';
export const WINDOW_ADDRESS_LINE =
  'Personen ohne E-Mail-Adresse richten hier ihren Zugang mit Name und Geburtsdatum ein.';
export const WINDOW_CLAIMS_TITLE = 'Gemeldet';
export const WINDOW_NO_CLAIMS = 'Noch niemand hat sich über das Anmeldefenster gemeldet.';
export const WINDOW_CLOSED_STATE = 'Geschlossen';
export const WINDOW_DENIED_MESSAGE = 'Dir fehlt die Berechtigung für das Anmeldefenster.';
export const WINDOW_FAILED_MESSAGE = 'Das Anmeldefenster lässt sich gerade nicht laden.';

export const toWindowOpenState = (closesAt: string): string => `Offen bis ${closesAt}`;

export const toClaimMeta = (claimedAt: string, hasAccount: boolean): string =>
  hasAccount
    ? `Zugang eingerichtet · ${claimedAt}`
    : `Gemeldet · ${claimedAt} · noch nicht eingerichtet`;
