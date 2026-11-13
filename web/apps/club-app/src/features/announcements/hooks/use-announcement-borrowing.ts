import { useKkSheetCommands } from '@furria/ui/sheet-store';
import { useState } from 'react';
import { useCalendarQuery } from '@/features/calendar/api';
import { shiftDay, toIsoDay } from '@/lib/day';
import type { BorrowEntryOption } from '../announcement-borrowing';
import {
  LENDING_WINDOW_DAYS,
  toBorrowOptions,
  toTickedBorrowings,
  withToggledKey,
} from '../announcement-borrowing';
import type { AnnouncementAddOnCardForm, BorrowedAddOnForm } from '../schemas';

const BORROW_SHEET_ID = 'announcement-borrow';
const NOTHING_TICKED: ReadonlySet<string> = new Set();

export interface AnnouncementBorrowing {
  sheetId: string;
  options: BorrowEntryOption[];
  isLoading: boolean;
  hasFailed: boolean;
  isRetrying: boolean;
  tickedCount: number;
  openSheet: () => void;
  retry: () => void;
  pick: (calendarEntryId: number) => void;
  toggle: (key: string) => void;
  confirm: () => void;
}

export const useAnnouncementBorrowing = (
  borrowAddOns: (picked: readonly BorrowedAddOnForm[]) => void,
  cards: readonly AnnouncementAddOnCardForm[],
): AnnouncementBorrowing => {
  const sheets = useKkSheetCommands();
  const [hasOpened, setHasOpened] = useState(false);
  const today = toIsoDay(new Date());
  const calendar = useCalendarQuery(
    { scope: 'all', groupId: null, from: today, to: shiftDay(today, LENDING_WINDOW_DAYS) },
    hasOpened,
  );
  const [pickedEntryId, setPickedEntryId] = useState<number | null>(null);
  const [tickedKeys, setTickedKeys] = useState<ReadonlySet<string>>(NOTHING_TICKED);
  const options = toBorrowOptions(calendar.data?.entries ?? [], cards, {
    pickedEntryId,
    tickedKeys,
  });
  const ticked = toTickedBorrowings(options);

  return {
    sheetId: BORROW_SHEET_ID,
    options,
    isLoading: calendar.isPending,
    hasFailed: calendar.isError,
    isRetrying: calendar.isFetching,
    tickedCount: ticked.length,
    openSheet: () => {
      setHasOpened(true);
      setPickedEntryId(null);
      setTickedKeys(NOTHING_TICKED);
      sheets.open(BORROW_SHEET_ID);
    },
    retry: () => {
      void calendar.refetch();
    },
    pick: (calendarEntryId) => {
      setPickedEntryId((picked) => (picked === calendarEntryId ? null : calendarEntryId));
      setTickedKeys(NOTHING_TICKED);
    },
    toggle: (key) => {
      setTickedKeys((keys) => withToggledKey(keys, key));
    },
    confirm: () => {
      borrowAddOns(ticked);
      sheets.close();
    },
  };
};
