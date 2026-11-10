import type { KkIconName } from '@furria/ui/KkIcon';
import { toDayScheduleForm, toNewDayScheduleForm } from './calendar-day-schedules';
import { toDiscardedVoterCount, toNewPollForm, toPollForm } from './calendar-polls';
import {
  toDiscardedLineCount,
  toNewSignUpListForm,
  toSignUpListForm,
} from './calendar-sign-up-lists';
import type {
  CalendarAddOnCardForm,
  CalendarAddOnKind,
  CalendarDayScheduleForm,
  CalendarEntryAddOn,
  CalendarPollForm,
  CalendarSignUpListForm,
  ParticipatingGroup,
} from './schemas';

export const ADD_ON_ORDER: readonly CalendarAddOnKind[] = [
  'attendance',
  'participatingGroups',
  'poll',
  'signUpList',
  'daySchedule',
];

const MULTI_USE_KINDS: readonly CalendarAddOnKind[] = ['poll', 'signUpList', 'daySchedule'];

export const CALENDAR_ADD_ON_LABELS: Record<CalendarAddOnKind, string> = {
  attendance: 'Zu-/Absage',
  participatingGroups: 'Mitwirkende Gruppen',
  poll: 'Umfrage',
  signUpList: 'Eintragsliste',
  daySchedule: 'Tagesablauf',
};

export const CALENDAR_ADD_ON_ICONS: Record<CalendarAddOnKind, KkIconName> = {
  attendance: 'checkCircle',
  participatingGroups: 'group',
  poll: 'poll',
  signUpList: 'signUpList',
  daySchedule: 'daySchedule',
};

let freshKeyCount = 0;
const FRESH_KEY_SEED = Date.now().toString(36);

export const nextFreshKey = (): string => {
  freshKeyCount += 1;

  return `new-${FRESH_KEY_SEED}-${freshKeyCount}`;
};

export const ADD_ON_LIMIT = 30;

export const isMultiUse = (kind: CalendarAddOnKind): boolean => MULTI_USE_KINDS.includes(kind);

export const toOfferedAddOns = (
  attached: readonly Pick<CalendarAddOnCardForm, 'kind'>[],
): CalendarAddOnKind[] =>
  attached.length >= ADD_ON_LIMIT
    ? []
    : ADD_ON_ORDER.filter(
        (kind) => isMultiUse(kind) || !attached.some((card) => card.kind === kind),
      );

export const toHeldAddOnKey = (addOn: CalendarEntryAddOn): string => {
  switch (addOn.kind) {
    case 'poll':
      return `poll-${addOn.poll.pollId}`;
    case 'signUpList':
      return `sign-up-list-${addOn.signUpList.signUpListId}`;
    case 'daySchedule':
      return `day-schedule-${addOn.daySchedule.dayScheduleId}`;
    default:
      return addOn.kind;
  }
};

const toAddOnCard = (addOn: CalendarEntryAddOn, nextKey: () => string): CalendarAddOnCardForm => {
  const key = toHeldAddOnKey(addOn);

  switch (addOn.kind) {
    case 'poll':
      return { key, kind: addOn.kind, poll: toPollForm(addOn.poll) };
    case 'signUpList':
      return { key, kind: addOn.kind, signUpList: toSignUpListForm(addOn.signUpList) };
    case 'daySchedule':
      return { key, kind: addOn.kind, daySchedule: toDayScheduleForm(addOn.daySchedule, nextKey) };
    default:
      return { key, kind: addOn.kind };
  }
};

export const toAddOnCards = (
  addOns: readonly CalendarEntryAddOn[],
  nextKey: () => string = nextFreshKey,
): CalendarAddOnCardForm[] => addOns.map((addOn) => toAddOnCard(addOn, nextKey));

export const toAttachedCards = (
  cards: readonly CalendarAddOnCardForm[],
  kind: CalendarAddOnKind,
  nextKey: () => string,
  startTime: string,
): CalendarAddOnCardForm[] => {
  if (kind === 'poll') {
    return [...cards, { key: nextKey(), kind, poll: toNewPollForm([nextKey(), nextKey()]) }];
  }
  if (kind === 'signUpList') {
    return [...cards, { key: nextKey(), kind, signUpList: toNewSignUpListForm() }];
  }
  if (kind === 'daySchedule') {
    return [
      ...cards,
      { key: nextKey(), kind, daySchedule: toNewDayScheduleForm(nextKey(), startTime) },
    ];
  }

  return cards.some((card) => card.kind === kind) ? [...cards] : [...cards, { key: kind, kind }];
};

export const toDetachedCards = (
  cards: readonly CalendarAddOnCardForm[],
  key: string,
): CalendarAddOnCardForm[] => cards.filter((card) => card.key !== key);

export const toChangedPollCards = (
  cards: readonly CalendarAddOnCardForm[],
  key: string,
  change: (poll: CalendarPollForm) => CalendarPollForm,
): CalendarAddOnCardForm[] =>
  cards.map((card) =>
    card.kind === 'poll' && card.key === key ? { ...card, poll: change(card.poll) } : card,
  );

export const toChangedSignUpListCards = (
  cards: readonly CalendarAddOnCardForm[],
  key: string,
  change: (list: CalendarSignUpListForm) => CalendarSignUpListForm,
): CalendarAddOnCardForm[] =>
  cards.map((card) =>
    card.kind === 'signUpList' && card.key === key
      ? { ...card, signUpList: change(card.signUpList) }
      : card,
  );

export const toChangedDayScheduleCards = (
  cards: readonly CalendarAddOnCardForm[],
  key: string,
  change: (schedule: CalendarDayScheduleForm) => CalendarDayScheduleForm,
): CalendarAddOnCardForm[] =>
  cards.map((card) =>
    card.kind === 'daySchedule' && card.key === key
      ? { ...card, daySchedule: change(card.daySchedule) }
      : card,
  );

export const hasAddOn = (
  attached: readonly Pick<CalendarEntryAddOn, 'kind'>[],
  kind: CalendarAddOnKind,
): boolean => attached.some((addOn) => addOn.kind === kind);

type HeldAnswers = {
  readonly addOns: readonly CalendarEntryAddOn[];
  readonly responseCount: number;
} | null;

export const toHeldAnswerCount = (entry: HeldAnswers): number =>
  entry !== null && hasAddOn(entry.addOns, 'attendance') ? entry.responseCount : 0;

export const toHeldParticipatingGroups = (
  entry: { readonly participatingGroups: readonly ParticipatingGroup[] } | null,
): readonly ParticipatingGroup[] => entry?.participatingGroups ?? [];

export const toDiscardedAnswerCount = (card: CalendarAddOnCardForm, entry: HeldAnswers): number => {
  switch (card.kind) {
    case 'attendance':
      return toHeldAnswerCount(entry);
    case 'participatingGroups':
      return 0;
    case 'poll':
      return toDiscardedVoterCount(entry?.addOns ?? null, card.poll.pollId);
    case 'signUpList':
      return toDiscardedLineCount(entry?.addOns ?? null, card.signUpList.signUpListId);
    case 'daySchedule':
      return 0;
  }
};
