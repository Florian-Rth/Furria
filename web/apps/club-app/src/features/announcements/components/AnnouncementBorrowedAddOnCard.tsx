import { KkAddOnCard } from '@furria/ui/KkAddOnCard';
import type { FC } from 'react';
import {
  CALENDAR_ADD_ON_ICONS,
  CALENDAR_ADD_ON_LABELS,
} from '@/features/calendar/calendar-add-ons';
import { REMOVE_BORROWED_LABEL, toBorrowedMeta } from '../announcements-labels';
import type { BorrowedAddOnForm } from '../schemas';

interface AnnouncementBorrowedAddOnCardProps {
  borrowed: BorrowedAddOnForm;
  onRemove: () => void;
}

export const AnnouncementBorrowedAddOnCard: FC<AnnouncementBorrowedAddOnCardProps> = ({
  borrowed,
  onRemove,
}) => {
  const meta = toBorrowedMeta(borrowed);

  return (
    <KkAddOnCard
      icon={CALENDAR_ADD_ON_ICONS[borrowed.lentKind]}
      title={CALENDAR_ADD_ON_LABELS[borrowed.lentKind]}
      meta={meta}
      removeLabel={REMOVE_BORROWED_LABEL}
      onRemove={onRemove}
    />
  );
};
