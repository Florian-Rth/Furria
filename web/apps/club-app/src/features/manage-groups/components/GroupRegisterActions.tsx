import { KkButton, KkIcon } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const EDIT_LABEL = 'Bearbeiten';
const ARCHIVE_LABEL = 'Archivieren';
const RESTORE_LABEL = 'Zurückholen';
const APPOINT_LABEL = 'Admin ernennen';

const CLUSTER = {
  alignItems: 'center',
  justifyContent: { xs: 'flex-start', desktop: 'flex-end' },
  gap: { xs: 0.5, desktop: 1 },
  flexWrap: 'wrap',
  minWidth: 0,
} as const;

interface GroupRegisterActionsProps {
  groupName: string;
  isArchived: boolean;
  needsAdmin: boolean;
  onAppointAdmin: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export const GroupRegisterActions: FC<GroupRegisterActionsProps> = ({
  groupName,
  isArchived,
  needsAdmin,
  onAppointAdmin,
  onEdit,
  onArchive,
  onRestore,
}) => {
  if (isArchived) {
    return (
      <Stack direction="row" sx={CLUSTER}>
        <KkButton
          size="small"
          variant="outlined"
          ariaLabel={`${groupName} ${RESTORE_LABEL}`}
          onClick={onRestore}
        >
          {RESTORE_LABEL}
        </KkButton>
      </Stack>
    );
  }

  const appoint = needsAdmin ? (
    <KkButton
      size="small"
      variant="text"
      startIcon={<KkIcon name="person" size="small" />}
      ariaLabel={`Gruppen-Admin für ${groupName} ernennen`}
      onClick={onAppointAdmin}
    >
      {APPOINT_LABEL}
    </KkButton>
  ) : null;

  return (
    <Stack direction="row" sx={CLUSTER}>
      {appoint}
      <KkButton
        size="small"
        variant="text"
        startIcon={<KkIcon name="edit" size="small" />}
        ariaLabel={`${groupName} ${EDIT_LABEL}`}
        onClick={onEdit}
      >
        {EDIT_LABEL}
      </KkButton>
      <KkButton
        size="small"
        variant="text"
        startIcon={<KkIcon name="archive" size="small" />}
        ariaLabel={`${groupName} ${ARCHIVE_LABEL}`}
        onClick={onArchive}
      >
        {ARCHIVE_LABEL}
      </KkButton>
    </Stack>
  );
};
