import type { KkDateQuickChoice } from '@furria/ui/KkDateField';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { CALENDAR_ADD_ON_LABELS } from '@/features/calendar/calendar-add-ons';
import { toCloserName } from '@/features/calendar/calendar-labels';
import { ANNOUNCEMENTS_PATH } from '@/features/session/app-sections';
import { toDayNumberLabel, toTimeLabel } from '@/lib/calendar-days';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { toAnswerCountOf } from './announcement-add-ons';
import type { AnnouncementAttendance, BorrowedAddOnForm } from './schemas';

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
export const ANNOUNCEMENT_EDIT_ACTION_LABEL = 'Aushang ändern';

export const ANNOUNCEMENT_TITLE_FIELD_LABEL = 'Titel';
export const ANNOUNCEMENT_BODY_FIELD_LABEL = 'Text';
export const ANNOUNCEMENT_VALID_UNTIL_FIELD_LABEL = 'Gültig bis';
export const ANNOUNCEMENT_VALID_UNTIL_EMPTY_LABEL = 'hängt bis jemand ihn abnimmt';
export const ANNOUNCEMENT_BODY_PLACEHOLDER = 'Text des Aushangs';
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

export const ADD_ONS_SECTION_TITLE = 'Funktionen';
export const ADD_ADD_ON_LABEL = 'Funktion hinzufügen';
export const ANSWERS_UNTIL_DAY_LABEL = 'Antworten bis';
export const DEADLINE_TIME_LABEL = 'Uhrzeit';
export const ANNOUNCEMENT_DEADLINE_EMPTY_LABEL = 'Solange der Aushang hängt';
export const REMOVE_ATTENDANCE_LABEL = 'Zu-/Absage entfernen';
export const BORROW_ADD_ONS_LABEL = 'Aus Kalendereintrag übernehmen';
export const BORROW_SHEET_CLOSE_LABEL = 'Schließen';
export const BORROW_NOTHING_LABEL = 'Keine kommenden Einträge mit Funktionen';
export const BORROW_FAILED_LABEL = 'Die Kalendereinträge konnten nicht geladen werden.';
export const BORROW_LOADING_LABEL = 'Die Kalendereinträge werden geladen';
export const REMOVE_BORROWED_LABEL = 'Übernahme entfernen';

export const toBorrowConfirmLabel = (count: number): string =>
  count === 0
    ? 'Funktionen antippen'
    : `${count} ${count === 1 ? 'Funktion' : 'Funktionen'} übernehmen`;

export const ANNOUNCEMENT_CREATE_TITLE = 'Aushang hinzufügen';
export const ANNOUNCEMENT_EDIT_TITLE = 'Aushang ändern';
export const ANNOUNCEMENT_ADD_LABEL = 'Hinzufügen';
export const ANNOUNCEMENT_SAVE_LABEL = 'Speichern';

export const WITHDRAW_EYEBROW = 'Aushang abnehmen';
export const WITHDRAW_EXPLANATION = 'Abgenommene Aushänge werden endgültig gelöscht.';
export const WITHDRAW_CONFIRM_LABEL = 'Aushang abnehmen';
export const WITHDRAW_CANCEL_LABEL = 'Abbrechen';
export const WITHDRAW_CLOSE_LABEL = 'Schließen';

export const ANNOUNCEMENT_ANSWER_FAILED_MESSAGE = 'Deine Antwort wurde nicht gespeichert.';
export const ANNOUNCEMENT_ATTENDANCE_CLOSE_FAILED_MESSAGE =
  'Die Zu-/Absage wurde nicht geschlossen.';

export const ANNOUNCEMENT_POSTED_MESSAGE = 'Der Aushang hängt.';
export const ANNOUNCEMENT_CHANGED_MESSAGE = 'Der Aushang ist geändert.';
export const ANNOUNCEMENT_WITHDRAWN_MESSAGE = 'Der Aushang ist abgenommen.';

export const NO_ANNOUNCEMENTS_TITLE = 'NOCH NICHTS AM BRETT';
export const NO_ANNOUNCEMENTS_LINE = 'Keine Aushänge.';

export const ANNOUNCEMENTS_ERROR_TITLE = 'AUSHÄNGE NICHT GELADEN';
export const ANNOUNCEMENTS_RETRY_LABEL = 'Erneut laden';

const VALID_UNTIL_PREFIX = 'Gültig bis';

export const toValidUntilLabel = (validUntil: string | null): string | null =>
  validUntil === null ? null : `${VALID_UNTIL_PREFIX} ${formatIsoDay(validUntil)}`;

export const toWithdrawQuestion = (title: string): string => `„${title}“ abnehmen?`;

export const toWithdrawConsequence = (title: string): string =>
  `„${title}“ lässt sich danach nicht wiederherstellen.`;

const ATTENDANCE_CLOSED_LABEL = 'Geschlossen';
const META_SEPARATOR = ' · ';

const toAnswersUntilLabel = (answersUntil: string): string =>
  `Antworten bis ${toDayNumberLabel(answersUntil)}, ${toTimeLabel(answersUntil)} Uhr`;

const toAttendanceDeadlineLabel = (attendance: AnnouncementAttendance): string | null => {
  if (attendance.isClosed) {
    const closer = toCloserName(attendance);

    return closer === null ? ATTENDANCE_CLOSED_LABEL : `${ATTENDANCE_CLOSED_LABEL} von ${closer}`;
  }

  return attendance.answersUntil === null ? null : toAnswersUntilLabel(attendance.answersUntil);
};

export const toAttendanceMetaLabel = (attendance: AnnouncementAttendance): string => {
  const answered = toAnswerCountOf(attendance);
  const share = `${answered} von ${attendance.concernedCount} haben geantwortet`;
  const deadline = toAttendanceDeadlineLabel(attendance);

  return deadline === null ? share : `${deadline}${META_SEPARATOR}${share}`;
};

export const CLOSE_ATTENDANCE_LABEL = 'Zu-/Absage schließen';

export const toAttendanceCloseQuestion = (title: string): string =>
  `Zu-/Absage zu „${title}“ schließen?`;

export const toWithdrawExplanation = (answerCount: number): string => {
  if (answerCount === 0) {
    return WITHDRAW_EXPLANATION;
  }

  const answers = answerCount === 1 ? 'eine Antwort' : `${answerCount} Antworten`;

  return `${WITHDRAW_EXPLANATION} Dabei gehen ${answers} verloren.`;
};

export const toEntryMomentLabel = (startsAt: string): string =>
  `${toDayNumberLabel(startsAt)}, ${toTimeLabel(startsAt)} Uhr`;

export const toLendingEntryLabel = (entry: { title: string; startsAt: string }): string =>
  `${entry.title}${META_SEPARATOR}${toEntryMomentLabel(entry.startsAt)}`;

export const toBorrowedMeta = (
  borrowed: Pick<BorrowedAddOnForm, 'name' | 'entryTitle' | 'entryStartsAt'>,
): string =>
  [borrowed.name, borrowed.entryTitle, toEntryMomentLabel(borrowed.entryStartsAt)]
    .filter((part) => part !== null)
    .join(META_SEPARATOR);

export const toBorrowOptionLabel = (
  borrowed: Pick<BorrowedAddOnForm, 'lentKind' | 'name'>,
): string =>
  borrowed.name === null
    ? CALENDAR_ADD_ON_LABELS[borrowed.lentKind]
    : `${CALENDAR_ADD_ON_LABELS[borrowed.lentKind]}: ${borrowed.name}`;
