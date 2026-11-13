import { KkSelectRow } from '@furria/ui/KkSelectRow';
import type { FC } from 'react';
import type { BorrowEntryOption } from '../announcement-borrowing';
import { toEntryMomentLabel } from '../announcements-labels';
import { AnnouncementBorrowAddOnRow } from './AnnouncementBorrowAddOnRow';

interface AnnouncementBorrowEntryProps {
  entry: BorrowEntryOption;
  onPick: (calendarEntryId: number) => void;
  onToggle: (key: string) => void;
}

export const AnnouncementBorrowEntry: FC<AnnouncementBorrowEntryProps> = ({
  entry,
  onPick,
  onToggle,
}) => {
  const meta = toEntryMomentLabel(entry.startsAt);
  const pick = (): void => {
    onPick(entry.calendarEntryId);
  };
  const addOns = entry.addOns.map((option) => (
    <AnnouncementBorrowAddOnRow key={option.key} option={option} onToggle={onToggle} />
  ));

  return (
    <>
      <KkSelectRow title={entry.title} meta={meta} selected={entry.isPicked} onClick={pick} />
      {addOns}
    </>
  );
};
