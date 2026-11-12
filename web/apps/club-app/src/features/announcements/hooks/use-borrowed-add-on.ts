import type { AddOnAnswering } from '@/features/calendar/add-on-host';
import { toEntryAnswering } from '@/features/calendar/add-on-host';
import { toEntrySearch } from '@/features/calendar/calendar-query';
import { useCalendarAuthoring } from '@/features/calendar/hooks/use-calendar-authoring';
import type { CalendarEntryAddOn } from '@/features/calendar/schemas';
import { toLentCalendarAddOn } from '../announcement-borrowing';
import { toLendingEntryLabel } from '../announcements-labels';
import type { BorrowedAnnouncementAddOn } from '../schemas';

export interface BorrowedAddOnView {
  lent: CalendarEntryAddOn | null;
  answering: AddOnAnswering;
  mayModerate: boolean;
  source: string;
  search: { day: string; entry: number };
}

export const useBorrowedAddOn = (addOn: BorrowedAnnouncementAddOn): BorrowedAddOnView => {
  const { authoring } = useCalendarAuthoring();

  return {
    lent: toLentCalendarAddOn(addOn.entry, addOn.lentKind, addOn.addOnId),
    answering: toEntryAnswering(addOn.entry),
    mayModerate: authoring?.mayOwn(addOn.entry) ?? false,
    source: toLendingEntryLabel(addOn.entry),
    search: toEntrySearch(addOn.entry),
  };
};
