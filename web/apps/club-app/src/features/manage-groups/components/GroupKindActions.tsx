import { KkButton, KkIcon, KkMeta } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ARCHIVE_GROUP_KIND_BLOCKED_HINT } from '../manage-groups-labels';

const RENAME_LABEL = 'Umbenennen';
const ARCHIVE_LABEL = 'Archivieren';
const RESTORE_LABEL = 'Aktivieren';

interface GroupKindActionsProps {
  isArchived: boolean;
  canArchive: boolean;
  onRename: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export const GroupKindActions: FC<GroupKindActionsProps> = ({
  isArchived,
  canArchive,
  onRename,
  onArchive,
  onRestore,
}) => {
  if (isArchived) {
    return (
      <KkButton size="small" variant="outlined" onClick={onRestore}>
        {RESTORE_LABEL}
      </KkButton>
    );
  }

  const blockedHint = canArchive ? null : <KkMeta>{ARCHIVE_GROUP_KIND_BLOCKED_HINT}</KkMeta>;

  return (
    <Stack
      direction="row"
      sx={{ gap: 0.75, flexWrap: 'wrap', alignItems: 'flex-start', minWidth: 0 }}
    >
      <KkButton
        size="small"
        variant="outlined"
        startIcon={<KkIcon name="edit" size="small" />}
        ariaLabel={RENAME_LABEL}
        onClick={onRename}
      >
        {RENAME_LABEL}
      </KkButton>
      <Stack sx={{ gap: 0.25, alignItems: 'flex-start', minWidth: 0 }}>
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
        {blockedHint}
      </Stack>
    </Stack>
  );
};
