import type { OpeningSlot, OpeningWeekday } from '@furria/api-client/opening-hours';
import { OPENING_WEEKDAYS } from '@furria/api-client/opening-hours';
import type { VenueOpeningSlotForm } from './schemas';

export type OpeningSlotIssueKind = 'reversed' | 'overlap';

export interface OpeningSlotIssue {
  index: number;
  kind: OpeningSlotIssueKind;
}

export const OPENING_SLOT_ISSUE_FIELDS: Record<OpeningSlotIssueKind, 'opens' | 'closes'> = {
  reversed: 'closes',
  overlap: 'opens',
};

const CLOCK_TIME_LENGTH = 5;
const FIRST_SLOT: VenueOpeningSlotForm = { weekday: 'monday', opens: '09:00', closes: '18:00' };

const isComplete = (slot: VenueOpeningSlotForm): boolean => slot.opens !== '' && slot.closes !== '';

const isReversed = (slot: VenueOpeningSlotForm): boolean =>
  isComplete(slot) && slot.closes <= slot.opens;

const overlaps = (first: VenueOpeningSlotForm, second: VenueOpeningSlotForm): boolean =>
  first.weekday === second.weekday && first.opens < second.closes && second.opens < first.closes;

const isCheckable = (slot: VenueOpeningSlotForm): boolean => isComplete(slot) && !isReversed(slot);

export const openingSlotIssuesOf = (slots: readonly VenueOpeningSlotForm[]): OpeningSlotIssue[] =>
  slots.flatMap((slot, index): OpeningSlotIssue[] => {
    if (isReversed(slot)) {
      return [{ index, kind: 'reversed' }];
    }

    const clashes =
      isCheckable(slot) &&
      slots.slice(0, index).some((earlier) => isCheckable(earlier) && overlaps(earlier, slot));

    return clashes ? [{ index, kind: 'overlap' }] : [];
  });

const weekdayAfter = (weekday: OpeningWeekday): OpeningWeekday =>
  OPENING_WEEKDAYS[(OPENING_WEEKDAYS.indexOf(weekday) + 1) % OPENING_WEEKDAYS.length] ?? weekday;

export const nextOpeningSlotOf = (slots: readonly VenueOpeningSlotForm[]): VenueOpeningSlotForm => {
  const last = slots[slots.length - 1];

  return last === undefined
    ? FIRST_SLOT
    : { weekday: weekdayAfter(last.weekday), opens: last.opens, closes: last.closes };
};

export const toOpeningSlotForms = (slots: readonly OpeningSlot[]): VenueOpeningSlotForm[] =>
  slots.map((slot) => ({
    weekday: slot.weekday,
    opens: slot.opens.slice(0, CLOCK_TIME_LENGTH),
    closes: slot.closes.slice(0, CLOCK_TIME_LENGTH),
  }));
