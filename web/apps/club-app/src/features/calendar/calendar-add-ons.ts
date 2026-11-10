import type { KkIconName } from '@furria/ui/KkIcon';
import type { CalendarEntryAddOn } from './schemas';

export const ADD_ON_ORDER: readonly CalendarEntryAddOn[] = ['attendance', 'participatingGroups'];

export const CALENDAR_ADD_ON_LABELS: Record<CalendarEntryAddOn, string> = {
  attendance: 'Zu-/Absage',
  participatingGroups: 'Mitwirkende Gruppen',
};

export const CALENDAR_ADD_ON_ICONS: Record<CalendarEntryAddOn, KkIconName> = {
  attendance: 'checkCircle',
  participatingGroups: 'group',
};

export const toOfferedAddOns = (attached: readonly CalendarEntryAddOn[]): CalendarEntryAddOn[] =>
  ADD_ON_ORDER.filter((addOn) => !attached.includes(addOn));

export const toAttachedAddOns = (
  attached: readonly CalendarEntryAddOn[],
  addOn: CalendarEntryAddOn,
): CalendarEntryAddOn[] => (attached.includes(addOn) ? [...attached] : [...attached, addOn]);

export const toDetachedAddOns = (
  attached: readonly CalendarEntryAddOn[],
  addOn: CalendarEntryAddOn,
): CalendarEntryAddOn[] => attached.filter((held) => held !== addOn);

export const toCalendarAddOn = (value: string): CalendarEntryAddOn | null =>
  ADD_ON_ORDER.find((known) => known === value) ?? null;

type HeldAnswers = {
  readonly addOns: readonly CalendarEntryAddOn[];
  readonly responseCount: number;
} | null;

export const toHeldAnswerCount = (entry: HeldAnswers): number =>
  entry?.addOns.includes('attendance') === true ? entry.responseCount : 0;

export const toDiscardedAnswerCount = (addOn: CalendarEntryAddOn, entry: HeldAnswers): number =>
  addOn === 'attendance' ? toHeldAnswerCount(entry) : 0;
