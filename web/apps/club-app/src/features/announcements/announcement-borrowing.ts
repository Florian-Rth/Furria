import { ADD_ON_LIMIT } from '@/features/calendar/calendar-add-ons';
import type { CalendarEntry, CalendarEntryAddOn } from '@/features/calendar/schemas';
import type {
  AnnouncementAddOnCardForm,
  AnnouncementAddOnKind,
  BorrowedAddOnForm,
} from './schemas';

export const LENDING_WINDOW_DAYS = 365;

export type LendingEntry = Pick<
  CalendarEntry,
  'calendarEntryId' | 'title' | 'startsAt' | 'addOns' | 'audience'
>;

export interface BorrowAddOnOption {
  key: string;
  borrowed: BorrowedAddOnForm;
  isTicked: boolean;
  isDisabled: boolean;
}

export interface BorrowEntryOption {
  calendarEntryId: number;
  title: string;
  startsAt: string;
  isPicked: boolean;
  addOns: BorrowAddOnOption[];
}

export interface BorrowChoice {
  pickedEntryId: number | null;
  tickedKeys: ReadonlySet<string>;
}

export const toBorrowedAddOnKey = (
  borrowed: Pick<BorrowedAddOnForm, 'lentKind' | 'calendarEntryId' | 'addOnId'>,
): string =>
  `borrowed-${borrowed.lentKind}-${borrowed.calendarEntryId}-${borrowed.addOnId ?? 'entry'}`;

const holdsLent = (
  held: CalendarEntryAddOn,
  kind: AnnouncementAddOnKind,
  addOnId: number | null,
): boolean =>
  (kind === 'attendance' && held.kind === 'attendance') ||
  (kind === 'poll' && held.kind === 'poll' && held.poll.pollId === addOnId) ||
  (kind === 'signUpList' && held.kind === 'signUpList' && held.signUpList.signUpListId === addOnId);

export const toLentCalendarAddOn = (
  entry: Pick<CalendarEntry, 'addOns'>,
  kind: AnnouncementAddOnKind,
  addOnId: number | null,
): CalendarEntryAddOn | null => entry.addOns.find((held) => holdsLent(held, kind, addOnId)) ?? null;

export const toLentName = (lent: CalendarEntryAddOn | null): string | null => {
  switch (lent?.kind) {
    case 'poll':
      return lent.poll.question;
    case 'signUpList':
      return lent.signUpList.title;
    default:
      return null;
  }
};

export const toBorrowedForm = (
  entry: Pick<CalendarEntry, 'calendarEntryId' | 'title' | 'startsAt' | 'addOns'>,
  kind: AnnouncementAddOnKind,
  addOnId: number | null,
): BorrowedAddOnForm => ({
  lentKind: kind,
  calendarEntryId: entry.calendarEntryId,
  addOnId,
  entryTitle: entry.title,
  entryStartsAt: entry.startsAt,
  name: toLentName(toLentCalendarAddOn(entry, kind, addOnId)),
});

const toLendable = (entry: LendingEntry, addOn: CalendarEntryAddOn): BorrowedAddOnForm[] => {
  switch (addOn.kind) {
    case 'attendance':
      return [toBorrowedForm(entry, 'attendance', null)];
    case 'poll':
      return [toBorrowedForm(entry, 'poll', addOn.poll.pollId)];
    case 'signUpList':
      return [toBorrowedForm(entry, 'signUpList', addOn.signUpList.signUpListId)];
    case 'participatingGroups':
    case 'daySchedule':
      return [];
  }
};

export const toLendableAddOns = (entry: LendingEntry): BorrowedAddOnForm[] =>
  entry.audience === 'people' ? [] : entry.addOns.flatMap((addOn) => toLendable(entry, addOn));

export const toBorrowSlots = (cards: readonly AnnouncementAddOnCardForm[]): number =>
  Math.max(0, ADD_ON_LIMIT - cards.length);

export const toBorrowedCards = (
  cards: readonly AnnouncementAddOnCardForm[],
  picked: readonly BorrowedAddOnForm[],
): AnnouncementAddOnCardForm[] => {
  const keys = new Set(cards.map((card) => card.key));
  const fresh = picked
    .map(
      (borrowed): AnnouncementAddOnCardForm => ({
        key: toBorrowedAddOnKey(borrowed),
        kind: 'borrowed',
        borrowed,
      }),
    )
    .filter((card) => !keys.has(card.key));

  return [...cards, ...fresh.slice(0, toBorrowSlots(cards))];
};

const toOpenLendings = (
  entry: LendingEntry,
  heldKeys: ReadonlySet<string>,
): { key: string; borrowed: BorrowedAddOnForm }[] =>
  toLendableAddOns(entry)
    .map((borrowed) => ({ key: toBorrowedAddOnKey(borrowed), borrowed }))
    .filter((lending) => !heldKeys.has(lending.key));

export const toBorrowOptions = (
  entries: readonly LendingEntry[],
  cards: readonly AnnouncementAddOnCardForm[],
  choice: BorrowChoice,
): BorrowEntryOption[] => {
  const heldKeys = new Set(cards.map((card) => card.key));
  const isFull = choice.tickedKeys.size >= toBorrowSlots(cards);

  return entries.flatMap((entry) => {
    const lendings = toOpenLendings(entry, heldKeys);
    const isPicked = entry.calendarEntryId === choice.pickedEntryId;

    if (lendings.length === 0) {
      return [];
    }

    return [
      {
        calendarEntryId: entry.calendarEntryId,
        title: entry.title,
        startsAt: entry.startsAt,
        isPicked,
        addOns: isPicked
          ? lendings.map((lending) => {
              const isTicked = choice.tickedKeys.has(lending.key);

              return { ...lending, isTicked, isDisabled: isFull && !isTicked };
            })
          : [],
      },
    ];
  });
};

export const toTickedBorrowings = (options: readonly BorrowEntryOption[]): BorrowedAddOnForm[] =>
  options.flatMap((entry) =>
    entry.addOns.filter((option) => option.isTicked).map((option) => option.borrowed),
  );

export const withToggledKey = (keys: ReadonlySet<string>, key: string): ReadonlySet<string> => {
  const next = new Set(keys);

  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }

  return next;
};
