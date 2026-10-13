import type { KkDateQuickChoice, KkScreenOrigin } from '@furria/ui';
import { ANNOUNCEMENTS_PATH } from '@/features/session';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';

export const ANNOUNCEMENTS_TITLE = 'Aushänge';
export const ANNOUNCEMENTS_ORIGIN: KkScreenOrigin = {
  label: ANNOUNCEMENTS_TITLE,
  to: ANNOUNCEMENTS_PATH,
};
export const ANNOUNCEMENTS_SECTION_TITLE = 'Am Brett';
export const ANNOUNCEMENTS_LOADING_LABEL = 'Die Aushänge werden geladen';

export const ANNOUNCEMENT_EXPIRED_LABEL = 'abgelaufen';

export const ADD_ANNOUNCEMENT_PILL_LABEL = 'Aushang';
export const ADD_ANNOUNCEMENT_ACTION_LABEL = 'Aushang hinzufügen';
export const WITHDRAW_ANNOUNCEMENT_DANGER_LABEL = 'Aushang abnehmen';

export const ANNOUNCEMENT_TITLE_FIELD_LABEL = 'Titel';
export const ANNOUNCEMENT_BODY_FIELD_LABEL = 'Text';
export const ANNOUNCEMENT_VALID_UNTIL_FIELD_LABEL = 'Gültig bis';
export const ANNOUNCEMENT_VALID_UNTIL_EMPTY_LABEL = 'hängt bis jemand ihn abnimmt';
export const ANNOUNCEMENT_BODY_PLACEHOLDER = 'Text des Aushangs';
export const ANNOUNCEMENT_BODY_HINT = 'Hängt für alle Mitglieder unter „Aushänge“.';
export const ANNOUNCEMENT_VALID_UNTIL_HINT = 'Danach gilt der Aushang als abgelaufen.';
export const ANNOUNCEMENT_CONTENT_SECTION_TITLE = 'Aushang';
export const ANNOUNCEMENT_RUNTIME_SECTION_TITLE = 'Laufzeit';

const ONE_WEEK_LABEL = 'in einer Woche';
const FOUR_WEEKS_LABEL = 'in vier Wochen';
const DAYS_PER_WEEK = 7;

const toDayInWeeks = (today: Date, weeks: number): string =>
  toIsoDay(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + weeks * DAYS_PER_WEEK),
  );

export const toValidUntilQuickChoices = (today: Date): KkDateQuickChoice[] => [
  { label: ONE_WEEK_LABEL, value: toDayInWeeks(today, 1) },
  { label: FOUR_WEEKS_LABEL, value: toDayInWeeks(today, 4) },
];

export const ANNOUNCEMENT_CREATE_TITLE = 'Aushang hinzufügen';
export const ANNOUNCEMENT_EDIT_TITLE = 'Aushang ändern';
export const ANNOUNCEMENT_ADD_LABEL = 'Hinzufügen';
export const ANNOUNCEMENT_SAVE_LABEL = 'Speichern';

export const WITHDRAW_EYEBROW = 'Aushang abnehmen';
export const WITHDRAW_EXPLANATION = 'Abgenommene Aushänge werden endgültig gelöscht.';
export const WITHDRAW_CONFIRM_LABEL = 'Aushang abnehmen';
export const WITHDRAW_CANCEL_LABEL = 'Abbrechen';
export const WITHDRAW_CLOSE_LABEL = 'Schließen';

export const ANNOUNCEMENT_POSTED_MESSAGE = 'Der Aushang hängt.';
export const ANNOUNCEMENT_CHANGED_MESSAGE = 'Der Aushang ist geändert.';
export const ANNOUNCEMENT_WITHDRAWN_MESSAGE = 'Der Aushang ist abgenommen.';

export const NO_ANNOUNCEMENTS_TITLE = 'NOCH NICHTS AM BRETT';
export const NO_ANNOUNCEMENTS_LINE = 'Neue Aushänge erscheinen hier.';

export const ANNOUNCEMENTS_ERROR_TITLE = 'AUSHÄNGE NICHT GELADEN';
export const ANNOUNCEMENTS_RETRY_LABEL = 'Erneut laden';

const VALID_UNTIL_PREFIX = 'Gültig bis';

export const toValidUntilLabel = (validUntil: string | null): string | null =>
  validUntil === null ? null : `${VALID_UNTIL_PREFIX} ${formatIsoDay(validUntil)}`;

export const ANNOUNCEMENTS_LEAD = 'Mitteilungen des Vereins an alle Mitglieder.';

export const toWithdrawQuestion = (title: string): string => `„${title}“ abnehmen?`;

export const toWithdrawConsequence = (title: string): string =>
  `„${title}“ lässt sich danach nicht wiederherstellen.`;
