import { KkButton, KkIcon } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const RENAME_LABEL = 'Umbenennen';
const ARCHIVE_LABEL = 'Archivieren';
const RESTORE_LABEL = 'Zurückholen';

const CLUSTER = { alignItems: 'center', gap: 0.5, flexWrap: 'wrap', minWidth: 0 } as const;

interface GroupKindActionsProps {
  name: string;
  isArchived: boolean;
  canArchive: boolean;
  onRename: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export const GroupKindActions: FC<GroupKindActionsProps> = ({
  name,
  isArchived,
  canArchive,
  onRename,
  onArchive,
  onRestore,
}) => {
  if (isArchived) {
    return (
      <Stack direction="row" sx={CLUSTER}>
        <KkButton
          size="small"
          variant="outlined"
          ariaLabel={`${name} ${RESTORE_LABEL}`}
          onClick={onRestore}
        >
          {RESTORE_LABEL}
        </KkButton>
      </Stack>
    );
  }

  const archive = canArchive ? (
    <KkButton
      size="small"
      variant="text"
      startIcon={<KkIcon name="archive" size="small" />}
      ariaLabel={`${name} ${ARCHIVE_LABEL}`}
      onClick={onArchive}
    >
      {ARCHIVE_LABEL}
    </KkButton>
  ) : null;

  return (
    <Stack direction="row" sx={CLUSTER}>
      <KkButton
        size="small"
        variant="text"
        startIcon={<KkIcon name="edit" size="small" />}
        ariaLabel={`${name} ${RENAME_LABEL}`}
        onClick={onRename}
      >
        {RENAME_LABEL}
      </KkButton>
      {archive}
    </Stack>
  );
};
