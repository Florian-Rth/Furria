import { KkHubRow, KkIconButton } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { ManageToDoRowModel } from '../manage-to-dos';

interface ManageToDoRowProps {
  row: ManageToDoRowModel;
  onToggleSeen: (row: ManageToDoRowModel) => void;
}

export const ManageToDoRow: FC<ManageToDoRowProps> = ({ row, onToggleSeen }) => {
  const toggleSeen = (): void => {
    onToggleSeen(row);
  };

  const seenToggle = (
    <KkIconButton
      label={row.toggleLabel}
      icon={row.toggleIcon}
      pressed={row.isSeenWhole}
      size="small"
      onClick={toggleSeen}
    />
  );

  return (
    <KkHubRow
      label={row.label}
      icon={row.icon}
      hint={row.count}
      hintTone={row.countTone}
      flag={row.flag}
      component={Link}
      to={row.link.to}
      search={row.link.search}
      action={seenToggle}
    />
  );
};
