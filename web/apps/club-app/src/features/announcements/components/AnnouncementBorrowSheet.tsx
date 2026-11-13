import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkSheet } from '@furria/ui/KkSheet';
import type { KkSheetAction } from '@furria/ui/sheet-actions';
import type { FC } from 'react';
import {
  BORROW_ADD_ONS_LABEL,
  BORROW_FAILED_LABEL,
  BORROW_LOADING_LABEL,
  BORROW_NOTHING_LABEL,
  BORROW_SHEET_CLOSE_LABEL,
  toBorrowConfirmLabel,
} from '../announcements-labels';
import type { AnnouncementBorrowing } from '../hooks/use-announcement-borrowing';
import { AnnouncementBorrowEntry } from './AnnouncementBorrowEntry';

interface AnnouncementBorrowSheetProps {
  borrowing: AnnouncementBorrowing;
}

export const AnnouncementBorrowSheet: FC<AnnouncementBorrowSheetProps> = ({ borrowing }) => {
  const entries = borrowing.options.map((entry) => (
    <AnnouncementBorrowEntry
      key={entry.calendarEntryId}
      entry={entry}
      onPick={borrowing.pick}
      onToggle={borrowing.toggle}
    />
  ));
  const emptyLabel = borrowing.isLoading ? BORROW_LOADING_LABEL : BORROW_NOTHING_LABEL;
  const list =
    entries.length === 0 ? (
      <KkMeta>{emptyLabel}</KkMeta>
    ) : (
      <KkPanel variant="list">{entries}</KkPanel>
    );
  const body = borrowing.hasFailed ? (
    <KkRetryAlert
      message={BORROW_FAILED_LABEL}
      retrying={borrowing.isRetrying}
      onRetry={borrowing.retry}
    />
  ) : (
    list
  );
  const confirm: KkSheetAction = {
    label: toBorrowConfirmLabel(borrowing.tickedCount),
    onClick: borrowing.confirm,
    disabled: borrowing.tickedCount === 0,
  };

  return (
    <KkSheet
      id={borrowing.sheetId}
      title={BORROW_ADD_ONS_LABEL}
      closeLabel={BORROW_SHEET_CLOSE_LABEL}
    >
      <KkSheet.Body>{body}</KkSheet.Body>
      <KkSheet.Actions primary={confirm} />
    </KkSheet>
  );
};
