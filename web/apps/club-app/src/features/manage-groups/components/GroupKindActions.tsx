import { KkButton, KkIcon, KkMeta } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toArchiveGroupKindBlockedHint } from '../manage-groups-labels';

const RENAME_LABEL = 'Umbenennen';
const ARCHIVE_LABEL = 'Archivieren';
const RESTORE_LABEL = 'Zurückholen';

const CLUSTER = {
  alignItems: 'flex-start',
  justifyContent: { xs: 'flex-start', desktop: 'flex-end' },
  gap: 1.25,
  flexWrap: 'nowrap',
  minWidth: 0,
} as const;

const BLOCKED = { gap: 0.25, alignItems: 'flex-start', minWidth: 0 } as const;

interface GroupKindActionsProps {
  name: string;
  groupCount: number;
  isArchived: boolean;
  canArchive: boolean;
  onRename: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export const GroupKindActions: FC<GroupKindActionsProps> = ({
  name,
  groupCount,
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
          variant="text"
          ariaLabel={`${name} ${RESTORE_LABEL}`}
          onClick={onRestore}
        >
          {RESTORE_LABEL}
        </KkButton>
      </Stack>
    );
  }

  const blockedHint = canArchive ? null : (
    <KkMeta>{toArchiveGroupKindBlockedHint(groupCount)}</KkMeta>
  );

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
      <Stack sx={BLOCKED}>
        <KkButton
          size="small"
          variant="text"
          disabled={!canArchive}
          startIcon={<KkIcon name="archive" size="small" />}
          ariaLabel={`${name} ${ARCHIVE_LABEL}`}
          onClick={onArchive}
        >
          {ARCHIVE_LABEL}
        </KkButton>
        {blockedHint}
      </Stack>
    </Stack>
  );
};
