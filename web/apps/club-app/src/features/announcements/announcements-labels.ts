import type { KkScreenOrigin } from '@furria/ui';
import { ANNOUNCEMENTS_PATH } from '@/features/session';
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
export const ANNOUNCEMENT_BODY_PLACEHOLDER = 'Was soll am Brett stehen?';

export const ANNOUNCEMENT_CREATE_TITLE = 'Aushang hinzufügen';
export const ANNOUNCEMENT_EDIT_TITLE = 'Aushang ändern';
export const ANNOUNCEMENT_ADD_LABEL = 'Hinzufügen';
export const ANNOUNCEMENT_SAVE_LABEL = 'Speichern';

export const WITHDRAW_EYEBROW = 'Aushang abnehmen';
export const WITHDRAW_EXPLANATION =
  'Ein abgenommener Aushang ist weg — vom Brett und aus der Liste, nicht nur bis später.';
export const WITHDRAW_CONFIRM_LABEL = 'Aushang abnehmen';
export const WITHDRAW_CANCEL_LABEL = 'Abbrechen';
export const WITHDRAW_CLOSE_LABEL = 'Schließen';

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

const ANNOUNCEMENT_ID_PATTERN = /^[1-9]\d*$/;

export const toAnnouncementIdParam = (raw: string): number | null =>
  ANNOUNCEMENT_ID_PATTERN.test(raw) ? Number(raw) : null;

export const toWithdrawQuestion = (title: string): string => `„${title}“ abnehmen?`;

export const toWithdrawConsequence = (title: string): string =>
  `„${title}“ verschwindet vom Brett und aus der Liste. Zurückholen lässt es sich nicht.`;
