import { KkButton, KkIcon, KkIconButton } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';

const HUB_PATH = '/groups/$groupId';

const EDIT_LABEL = 'Bearbeiten';
const ARCHIVE_LABEL = 'Archivieren';
const RESTORE_LABEL = 'Zurückholen';
const HUB_LABEL = 'Zur Gruppe';

const CLUSTER = {
  alignItems: 'center',
  justifyContent: { xs: 'flex-start', desktop: 'flex-end' },
  gap: 1,
  flexWrap: 'nowrap',
  minWidth: 0,
} as const;

const HUB_BUTTON = { flexShrink: 0 } as const;

interface GroupRegisterActionsProps {
  groupId: number;
  groupName: string;
  isArchived: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export const GroupRegisterActions: FC<GroupRegisterActionsProps> = ({
  groupId,
  groupName,
  isArchived,
  onEdit,
  onArchive,
  onRestore,
}) => {
  const params = { groupId: String(groupId) };

  const hubLink = (
    <KkIconButton
      component={Link}
      to={HUB_PATH}
      params={params}
      icon="chevron"
      size="small"
      label={`${HUB_LABEL} ${groupName}`}
      sx={HUB_BUTTON}
    />
  );

  const lifecycle = isArchived ? (
    <KkButton
      size="small"
      variant="text"
      ariaLabel={`${groupName} ${RESTORE_LABEL}`}
      onClick={onRestore}
    >
      {RESTORE_LABEL}
    </KkButton>
  ) : (
    <>
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
    </>
  );

  return (
    <Stack direction="row" sx={CLUSTER}>
      {lifecycle}
      {hubLink}
    </Stack>
  );
};
