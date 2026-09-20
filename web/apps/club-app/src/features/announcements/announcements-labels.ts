import { formatIsoDay } from '@/lib/membership-labels';

export const ANNOUNCEMENTS_TITLE = 'Aushänge';
export const ANNOUNCEMENTS_LOADING_LABEL = 'Die Aushänge werden geladen';

export const ANNOUNCEMENT_EXPIRED_LABEL = 'abgelaufen';

export const POST_ANNOUNCEMENT_LABEL = 'Aushang schreiben';
export const EDIT_ANNOUNCEMENT_LABEL = 'Ändern';
export const WITHDRAW_ANNOUNCEMENT_LABEL = 'Abnehmen';

export const ANNOUNCEMENT_TITLE_FIELD_LABEL = 'Titel';
export const ANNOUNCEMENT_BODY_FIELD_LABEL = 'Text';
export const ANNOUNCEMENT_VALID_UNTIL_FIELD_LABEL = 'Gültig bis';
export const ANNOUNCEMENT_VALID_UNTIL_EMPTY_LABEL = 'hängt bis jemand ihn abnimmt';
export const ANNOUNCEMENT_BODY_PLACEHOLDER = 'Was soll am Brett stehen?';

export const POST_SHEET_TITLE = 'Aushang schreiben';
export const EDIT_SHEET_TITLE = 'Aushang ändern';
export const POST_CONFIRM_LABEL = 'Aushängen';
export const EDIT_CONFIRM_LABEL = 'Speichern';
export const SHEET_CLOSE_LABEL = 'Schließen';
export const SHEET_CANCEL_LABEL = 'Abbrechen';

export const WITHDRAW_EYEBROW = 'Aushang abnehmen';
export const WITHDRAW_EXPLANATION =
  'Der Aushang verschwindet vom Brett und aus der Liste. Zurückholen lässt er sich nicht.';
export const WITHDRAW_CONFIRM_LABEL = 'Abnehmen';

export const ANNOUNCEMENT_POSTED_MESSAGE = 'Der Aushang hängt.';
export const ANNOUNCEMENT_CHANGED_MESSAGE = 'Der Aushang ist geändert.';
export const ANNOUNCEMENT_WITHDRAWN_MESSAGE = 'Der Aushang ist abgenommen.';

export const NO_ANNOUNCEMENTS_TITLE = 'NOCH NICHTS AM BRETT';
export const NO_ANNOUNCEMENTS_LINE =
  'Hier steht, was der Verein alle wissen lassen will. Gerade hängt nichts.';

export const ANNOUNCEMENTS_ERROR_TITLE = 'AUSHÄNGE NICHT GELADEN';
export const ANNOUNCEMENTS_RETRY_LABEL = 'Erneut laden';

const VALID_UNTIL_PREFIX = 'Gültig bis';
const ONE_ANNOUNCEMENT = 1;

export const toValidUntilLabel = (validUntil: string | null): string | null =>
  validUntil === null ? null : `${VALID_UNTIL_PREFIX} ${formatIsoDay(validUntil)}`;

export const toAnnouncementsLead = (count: number): string =>
  count === ONE_ANNOUNCEMENT ? '1 Aushang' : `${count} Aushänge`;

export const toWithdrawQuestion = (title: string): string => `„${title}“ abnehmen?`;
