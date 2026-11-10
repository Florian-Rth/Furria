import type { KkIconName } from '@furria/ui/KkIcon';
import { toDiscardedVoterCount, toNewPollForm, toPollForm } from './calendar-polls';
import type {
  CalendarAddOnCardForm,
  CalendarAddOnKind,
  CalendarEntryAddOn,
  CalendarPollForm,
  ParticipatingGroup,
} from './schemas';

export const ADD_ON_ORDER: readonly CalendarAddOnKind[] = [
  'attendance',
  'participatingGroups',
  'poll',
];

const MULTI_USE_KINDS: readonly CalendarAddOnKind[] = ['poll'];

export const CALENDAR_ADD_ON_LABELS: Record<CalendarAddOnKind, string> = {
  attendance: 'Zu-/Absage',
  participatingGroups: 'Mitwirkende Gruppen',
  poll: 'Umfrage',
};

export const CALENDAR_ADD_ON_ICONS: Record<CalendarAddOnKind, KkIconName> = {
  attendance: 'checkCircle',
  participatingGroups: 'group',
  poll: 'poll',
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

export const toHeldAddOnKey = (addOn: CalendarEntryAddOn): string =>
  addOn.kind === 'poll' ? `poll-${addOn.poll.pollId}` : addOn.kind;

const toAddOnCard = (addOn: CalendarEntryAddOn): CalendarAddOnCardForm => {
  const key = toHeldAddOnKey(addOn);

  return addOn.kind === 'poll'
    ? { key, kind: addOn.kind, poll: toPollForm(addOn.poll) }
    : { key, kind: addOn.kind };
};

export const toAddOnCards = (addOns: readonly CalendarEntryAddOn[]): CalendarAddOnCardForm[] =>
  addOns.map(toAddOnCard);

export const toAttachedCards = (
  cards: readonly CalendarAddOnCardForm[],
  kind: CalendarAddOnKind,
  nextKey: () => string,
): CalendarAddOnCardForm[] => {
  if (kind === 'poll') {
    return [...cards, { key: nextKey(), kind, poll: toNewPollForm([nextKey(), nextKey()]) }];
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
  }
};
