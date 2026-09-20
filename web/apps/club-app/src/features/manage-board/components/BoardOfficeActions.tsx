import { KkButton, KkIcon, KkMeta } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ARCHIVE_OFFICE_BLOCKED_HINT } from '../manage-board-labels';

const OPEN_SEAT_LABEL = 'Sitz besetzen';
const OPEN_SEAT_TEXT = 'Besetzen';
const RENAME_LABEL = 'Umbenennen';
const ARCHIVE_LABEL = 'Archivieren';
const RESTORE_LABEL = 'Aktivieren';

interface BoardOfficeActionsProps {
  isArchived: boolean;
  canArchive: boolean;
  onOpenSeat: () => void;
  onRename: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export const BoardOfficeActions: FC<BoardOfficeActionsProps> = ({
  isArchived,
  canArchive,
  onOpenSeat,
  onRename,
  onArchive,
  onRestore,
}) => {
  if (isArchived) {
    return (
      <Stack sx={{ alignItems: 'flex-end', flexShrink: 0, minWidth: 0 }}>
        <KkButton size="small" variant="outlined" onClick={onRestore}>
          {RESTORE_LABEL}
        </KkButton>
      </Stack>
    );
  }

  const blockedHint = canArchive ? null : <KkMeta>{ARCHIVE_OFFICE_BLOCKED_HINT}</KkMeta>;

  return (
    <Stack sx={{ gap: 0.5, alignItems: 'flex-end', flexShrink: 0, minWidth: 0 }}>
      <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
        <KkButton
          size="small"
          variant="outlined"
          startIcon={<KkIcon name="add" size="small" />}
          ariaLabel={OPEN_SEAT_LABEL}
          onClick={onOpenSeat}
        >
          {OPEN_SEAT_TEXT}
        </KkButton>
        <KkButton
          size="small"
          variant="outlined"
          startIcon={<KkIcon name="edit" size="small" />}
          ariaLabel={RENAME_LABEL}
          onClick={onRename}
        >
          {RENAME_LABEL}
        </KkButton>
        <KkButton
          size="small"
          variant="outlined"
          disabled={!canArchive}
          startIcon={<KkIcon name="archive" size="small" />}
          ariaLabel={ARCHIVE_LABEL}
          onClick={onArchive}
        >
          {ARCHIVE_LABEL}
        </KkButton>
      </Stack>
      {blockedHint}
    </Stack>
  );
};
