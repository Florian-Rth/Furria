import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';
import type { KkDateQuickChoice } from '@furria/ui/KkDateField';
import type { KkSelectOption } from '@furria/ui/KkSelectField';
import { CALENDAR_KIND_LABELS } from '@/lib/calendar-copy';
import {
  toDayNumberLabel,
  toIsoDayLabel,
  toLocalIsoDay,
  toTimeLabel,
  toTimeSpanLabel,
} from '@/lib/calendar-days';
import { shiftDay, toIsoDay } from '@/lib/day';
import { CALENDAR_ADD_ON_LABELS } from './calendar-add-ons';
import type { CalendarOwnerOption } from './calendar-authoring';
import { AUDIENCE_ORDER, AUTHORED_KINDS, NO_VENUE_ID } from './calendar-authoring';
import { isIsoDay } from './calendar-day-schedules';
import type { CalendarGroupShortcut } from './calendar-people';
import { toPersonName } from './calendar-people';
import type { CalendarPollOutcome } from './calendar-polls';
import type { RemindedAt, ReminderFailure, ReminderMeta } from './calendar-reminders';
import type {
  CalendarAddOnKind,
  CalendarEntry,
  CalendarEntryAudience,
  CalendarPoll,
  CalendarSignUpList,
  RunningVenue,
} from './schemas';

export const CALENDAR_ERROR_TITLE = 'KALENDER NICHT GELADEN';
export const CALENDAR_RETRY_LABEL = 'Noch einmal';
export const CALENDAR_ENTRY_CREATE_TITLE = 'Termin hinzufügen';
export const CALENDAR_ENTRY_EDIT_TITLE = 'Termin ändern';
export const DELETE_ENTRY_DANGER_LABEL = 'Termin löschen';

const TODAY_LABEL = 'Heute';
const TOMORROW_LABEL = 'Morgen';
const SAME_DAY_LABEL = 'Selber Tag';
const NEXT_DAY_LABEL = 'Folgetag';
const CLUB_OWNER_LABEL = 'Verein';
const NO_VENUE_LABEL = 'Kein Ort';

const CALENDAR_AUDIENCE_LABELS: Record<CalendarEntryAudience, string> = {
  club: 'Verein',
  groups: 'Gruppen',
  people: 'Ausgewählte Personen',
};

export const CALENDAR_KIND_OPTIONS: readonly KkSelectOption[] = AUTHORED_KINDS.map((kind) => ({
  value: kind,
  label: CALENDAR_KIND_LABELS[kind],
}));

export const CALENDAR_AUDIENCE_OPTIONS: readonly KkSelectOption[] = AUDIENCE_ORDER.map(
  (audience) => ({ value: audience, label: CALENDAR_AUDIENCE_LABELS[audience] }),
);

export const toVenueOptions = (venues: readonly RunningVenue[]): KkSelectOption[] => [
  { value: NO_VENUE_ID, label: NO_VENUE_LABEL },
  ...venues.map((venue) => ({ value: String(venue.venueId), label: venue.name })),
];

export const toOwnerSelectOptions = (options: readonly CalendarOwnerOption[]): KkSelectOption[] =>
  options.map((option) => ({ value: option.id, label: option.label }));

export const toStartDayQuickChoices = (today: Date): KkDateQuickChoice[] => [
  { label: TODAY_LABEL, value: toIsoDay(today) },
  {
    label: TOMORROW_LABEL,
    value: toIsoDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)),
  },
];

export const toEndDayQuickChoices = (startDay: string): KkDateQuickChoice[] => [
  { label: SAME_DAY_LABEL, value: startDay },
  { label: NEXT_DAY_LABEL, value: shiftDay(startDay, 1) },
];

const toEntryOwnerLabel = (entry: CalendarEntry): string =>
  entry.ownerGroupName ?? CLUB_OWNER_LABEL;

export const toEntryFacts = (entry: CalendarEntry): KkConfirmFact[] => {
  const facts: KkConfirmFact[] = [
    { label: 'Termin', value: entry.title },
    {
      label: 'Wann',
      value: `${toIsoDayLabel(toLocalIsoDay(entry.startsAt))}, ${toTimeSpanLabel(entry.startsAt, entry.endsAt)}`,
    },
    { label: 'Art', value: CALENDAR_KIND_LABELS[entry.kind] },
    { label: 'Eigentümer', value: toEntryOwnerLabel(entry) },
  ];

  if (entry.venueName !== null) {
    facts.push({ label: 'Ort', value: entry.venueName });
  }

  return facts;
};

export const toDeleteConsequence = (entry: CalendarEntry): string => {
  if (entry.asksForResponse) {
    return `„${entry.title}“ wird mit allen Zu- und Absagen gelöscht.`;
  }

  return `„${entry.title}“ wird endgültig gelöscht.`;
};

export const toEntryCreatedMessage = (title: string): string =>
  `„${title}“ steht jetzt im Kalender.`;

export const toEntrySavedMessage = (title: string): string => `„${title}“ ist gespeichert.`;

export const toEntryDeletedMessage = (title: string): string =>
  `„${title}“ ist aus dem Kalender gelöscht.`;

const NO_MATCH_LABEL = 'Niemand gefunden.';

export const toGroupShortcutOptions = (
  shortcuts: readonly CalendarGroupShortcut[],
): KkSelectOption[] =>
  shortcuts.map((shortcut) => ({
    value: String(shortcut.groupId),
    label: `${shortcut.name} (${shortcut.missingIds.length})`,
  }));

export const toNoMatchLabel = (
  query: string,
  matchCount: number,
  isLoading: boolean,
): string | null => (query.trim() === '' || matchCount > 0 || isLoading ? null : NO_MATCH_LABEL);

const byCount = (count: number, one: string, many: string): string => (count === 1 ? one : many);

export const toAnswerCountLabel = (count: number): string | undefined =>
  count === 0 ? undefined : byCount(count, '1 Antwort', `${count} Antworten`);

export const toAddOnRemovalQuestion = (kind: CalendarAddOnKind): string =>
  `${CALENDAR_ADD_ON_LABELS[kind]} entfernen?`;

export const toDiscardedAnswersLabel = (kind: CalendarAddOnKind, count: number): string => {
  switch (kind) {
    case 'poll':
      return byCount(
        count,
        'Beim Speichern wird die Stimme von 1 Person gelöscht.',
        `Beim Speichern werden die Stimmen von ${count} Personen gelöscht.`,
      );
    case 'signUpList':
      return byCount(
        count,
        'Beim Speichern wird 1 Eintrag gelöscht.',
        `Beim Speichern werden ${count} Einträge gelöscht.`,
      );
    default:
      return byCount(
        count,
        'Beim Speichern wird 1 Antwort gelöscht.',
        `Beim Speichern werden ${count} Antworten gelöscht.`,
      );
  }
};

export const toVoterCountLabel = (count: number): string | undefined =>
  count === 0
    ? undefined
    : byCount(count, '1 Person hat abgestimmt', `${count} Personen haben abgestimmt`);

export type AnswerShare =
  | { kind: 'share'; count: number; of: number }
  | { kind: 'count'; count: number };

export const toAnswerShare = (count: number, concernedCount: number | null): AnswerShare =>
  concernedCount === null ? { kind: 'count', count } : { kind: 'share', count, of: concernedCount };

const toVoterShareLabel = (share: AnswerShare): string | undefined =>
  share.kind === 'count'
    ? toVoterCountLabel(share.count)
    : `${share.count} von ${share.of} haben abgestimmt`;

export const toVotesLabel = (count: number): string =>
  byCount(count, '1 Stimme', `${count} Stimmen`);

export const toVotesUntilLabel = (votesUntil: string): string =>
  `Abstimmen bis ${toDayNumberLabel(votesUntil)}, ${toTimeLabel(votesUntil)} Uhr`;

export const toPollOptionFieldLabel = (optionIndex: number): string => `Antwort ${optionIndex + 1}`;

export const toPollOptionRemoveLabel = (optionIndex: number): string =>
  `Antwort ${optionIndex + 1} entfernen`;

export const toPollRemoveLabel = (question: string): string =>
  question.trim() === '' ? 'Umfrage entfernen' : `Umfrage „${question.trim()}“ entfernen`;

export const POLL_VOTE_FAILED_MESSAGE = 'Deine Stimme wurde nicht gespeichert.';
export const POLL_CLOSE_FAILED_MESSAGE = 'Die Umfrage wurde nicht beendet.';
export const POLL_REOPEN_FAILED_MESSAGE = 'Die Umfrage wurde nicht wieder geöffnet.';

const POLL_CLOSED_LABEL = 'Beendet';
const POLL_ANONYMOUS_LABEL = 'Anonym';
const META_SEPARATOR = ' · ';

interface ClosingFacts {
  closedByFirstName: string | null;
  closedByLastName: string | null;
}

export const toCloserName = (closing: ClosingFacts): string | null =>
  closing.closedByFirstName === null || closing.closedByLastName === null
    ? null
    : toPersonName({ firstName: closing.closedByFirstName, lastName: closing.closedByLastName });

const toClosedLabel = (closedLabel: string, closing: ClosingFacts): string => {
  const closer = toCloserName(closing);

  return closer === null ? closedLabel : `${closedLabel} von ${closer}`;
};

const joinMeta = (parts: readonly (string | undefined)[]): string | undefined => {
  const shown = parts.filter((part): part is string => part !== undefined);

  return shown.length === 0 ? undefined : shown.join(META_SEPARATOR);
};

interface PollMetaFacts extends ClosingFacts {
  isClosed: boolean;
  isAnonymous: boolean;
  votesUntil: string | null;
  voterCount: number;
  concernedCount: number | null;
}

const toPollDeadlineLabel = (poll: PollMetaFacts): string | undefined => {
  if (poll.isClosed) {
    return toClosedLabel(POLL_CLOSED_LABEL, poll);
  }

  return poll.votesUntil === null ? undefined : toVotesUntilLabel(poll.votesUntil);
};

export const toPollMetaLabel = (poll: PollMetaFacts): string | undefined => {
  const anonymity = poll.isAnonymous ? POLL_ANONYMOUS_LABEL : undefined;

  return joinMeta([
    toPollDeadlineLabel(poll),
    anonymity,
    toVoterShareLabel(toAnswerShare(poll.voterCount, poll.concernedCount)),
  ]);
};

export const toPollCardMetaLabel = (
  held: Pick<CalendarPoll, 'isClosed' | 'voterCount'> | null,
): string | undefined => {
  const closed = held?.isClosed === true ? POLL_CLOSED_LABEL : undefined;

  return joinMeta([closed, toVoterCountLabel(held?.voterCount ?? 0)]);
};

export const toPollOutcomeLabel = (outcome: CalendarPollOutcome): string | undefined => {
  if (outcome.kind === 'none') {
    return undefined;
  }

  const answers = outcome.labels.join(', ');

  return outcome.kind === 'winner'
    ? `Ergebnis: ${answers} · ${toVotesLabel(outcome.count)}`
    : `Gleichstand: ${answers} · je ${toVotesLabel(outcome.count)}`;
};

export const toPollCloseQuestion = (question: string): string => `„${question}“ beenden?`;

export const toLineCountLabel = (count: number): string | undefined =>
  count === 0 ? undefined : byCount(count, '1 Eintrag', `${count} Einträge`);

const toLineShareLabel = (share: AnswerShare): string | undefined =>
  share.kind === 'count'
    ? toLineCountLabel(share.count)
    : `${share.count} von ${share.of} eingetragen`;

export const toSignUpUntilLabel = (signUpUntil: string): string =>
  `Eintragen bis ${toDayNumberLabel(signUpUntil)}, ${toTimeLabel(signUpUntil)} Uhr`;

export const toSignUpListRemoveLabel = (title: string): string =>
  title.trim() === '' ? 'Eintragsliste entfernen' : `Eintragsliste „${title.trim()}“ entfernen`;

const SIGN_UP_LIST_CLOSED_LABEL = 'Geschlossen';

type SignUpListMetaFacts = Pick<
  CalendarSignUpList,
  'isClosed' | 'signUpUntil' | 'lines' | 'concernedCount' | 'closedByFirstName' | 'closedByLastName'
>;

const toSignUpDeadlineLabel = (list: SignUpListMetaFacts): string | undefined => {
  if (list.isClosed) {
    return toClosedLabel(SIGN_UP_LIST_CLOSED_LABEL, list);
  }

  return list.signUpUntil === null ? undefined : toSignUpUntilLabel(list.signUpUntil);
};

export const toSignUpListMetaLabel = (list: SignUpListMetaFacts): string | undefined => {
  return joinMeta([
    toSignUpDeadlineLabel(list),
    toLineShareLabel(toAnswerShare(list.lines.length, list.concernedCount)),
  ]);
};

export const toSignUpListCardMetaLabel = (
  held: Pick<CalendarSignUpList, 'isClosed' | 'lines'> | null,
): string | undefined => {
  const closed = held?.isClosed === true ? SIGN_UP_LIST_CLOSED_LABEL : undefined;

  return joinMeta([closed, toLineCountLabel(held?.lines.length ?? 0)]);
};

export const toSignUpListCloseQuestion = (title: string): string => `„${title}“ schließen?`;

export const toLineRemovalQuestion = (name: string): string => `Eintrag von ${name} entfernen?`;

export const toLineRemoveLabel = (name: string): string => `Eintrag von ${name} entfernen`;

export const SIGN_UP_LINE_SAVE_FAILED_MESSAGE = 'Dein Eintrag wurde nicht gespeichert.';
export const SIGN_UP_LINE_DELETE_FAILED_MESSAGE = 'Dein Eintrag wurde nicht gelöscht.';
export const SIGN_UP_LINE_REMOVE_FAILED_MESSAGE = 'Der Eintrag wurde nicht entfernt.';
export const SIGN_UP_LIST_CLOSE_FAILED_MESSAGE = 'Die Liste wurde nicht geschlossen.';
export const REMIND_LABEL = 'Erinnern';
export const REMINDER_SENT_MESSAGE = 'Erinnerung verschickt.';
const REMINDER_UNREACHABLE_LABEL = 'Niemand mit App';

export const REMINDER_FAILURE_MESSAGES: Record<ReminderFailure, string> = {
  recentlyReminded: 'Gerade erst erinnert.',
  failed: 'Die Erinnerung wurde nicht verschickt.',
};

export const toReminderQuestion = (reachableCount: number): string =>
  reachableCount === 1 ? '1 Person erinnern?' : `${reachableCount} Personen erinnern?`;

const toRemindedLabel = (reminded: RemindedAt): string =>
  reminded.kind === 'today' ? `Erinnert um ${reminded.time}` : `Erinnert am ${reminded.day}`;

const toRemindAgainLabel = (time: string): string => `Wieder ab ${time}`;

export const toReminderMetaLabel = (meta: ReminderMeta): string => {
  switch (meta.kind) {
    case 'unreachable':
      return REMINDER_UNREACHABLE_LABEL;
    case 'again':
      return toRemindAgainLabel(meta.time);
    default:
      return toRemindedLabel(meta.reminded);
  }
};

export const toStepCountLabel = (count: number): string | undefined =>
  count === 0 ? undefined : byCount(count, '1 Schritt', `${count} Schritte`);

export const toDayScheduleRemoveLabel = (title: string): string =>
  title.trim() === '' ? 'Tagesablauf entfernen' : `Tagesablauf „${title.trim()}“ entfernen`;

export const toStepRemoveLabel = (position: number): string => `Schritt ${position} entfernen`;

export const toStepTextLabel = (position: number): string => `Schritt ${position}`;

export const toScheduleDayLabel = (startDay: string, day: number): string =>
  isIsoDay(startDay) ? toIsoDayLabel(shiftDay(startDay, day)) : `Tag ${day + 1}`;

export const toScheduleDayOptions = (
  startDay: string,
  span: number,
  heldDays: readonly number[],
): KkSelectOption[] => {
  const days = [...new Set([...Array.from({ length: span }, (_, day) => day), ...heldDays])].sort(
    (left, right) => left - right,
  );

  return days.map((day) => ({ value: String(day), label: toScheduleDayLabel(startDay, day) }));
};

export const toScheduleStepsLabel = (title: string | null): string =>
  title === null ? 'Schritte' : `Schritte: ${title}`;
