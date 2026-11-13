import { KkCheckboxRow } from '@furria/ui/KkCheckboxRow';
import type { FC } from 'react';
import type { BorrowAddOnOption } from '../announcement-borrowing';
import { toBorrowOptionLabel } from '../announcements-labels';

interface AnnouncementBorrowAddOnRowProps {
  option: BorrowAddOnOption;
  onToggle: (key: string) => void;
}

export const AnnouncementBorrowAddOnRow: FC<AnnouncementBorrowAddOnRowProps> = ({
  option,
  onToggle,
}) => {
  const label = toBorrowOptionLabel(option.borrowed);
  const toggle = (): void => {
    onToggle(option.key);
  };

  return (
    <KkCheckboxRow
      label={label}
      checked={option.isTicked}
      disabled={option.isDisabled}
      onChange={toggle}
    />
  );
};
