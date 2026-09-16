import { KkButton, KkChip, KkIcon, KkMeta, KkNote, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppRecordHeaderCard } from '@/features/session';
import { ARCHIVED_CHIP } from '@/lib/state-chips';
import { toArchivedMeta, toNoDescriptionLine } from '../manage-roles-labels';
import type { RoleDetails } from '../schemas';

const EYEBROW = 'Rolle';
const RENAME_LABEL = 'Umbenennen';
const ARCHIVE_LABEL = 'Archivieren';
const RESTORE_LABEL = 'Aktivieren';
const ARCHIVED_NOTE =
  'Diese Rolle ist archiviert. Ihre Rechte greifen nicht mehr, und sie lässt sich erst nach dem Aktivieren wieder bearbeiten.';

interface RoleHeaderCardProps {
  role: RoleDetails;
  onRename: () => void;
  onArchive: () => void;
  onRestore: () => void;
  isRestoring: boolean;
}

export const RoleHeaderCard: FC<RoleHeaderCardProps> = ({
  role,
  onRename,
  onArchive,
  onRestore,
  isRestoring,
}) => {
  const isArchived = role.archivedOn !== null;
  const archivedMeta = toArchivedMeta(role.archivedOn);

  const description =
    role.description === '' ? (
      <KkMeta italic>{toNoDescriptionLine(role.name)}</KkMeta>
    ) : (
      <KkText variant="body2">{role.description}</KkText>
    );

  const chips = isArchived ? (
    <KkChip tone={ARCHIVED_CHIP.tone} dot={ARCHIVED_CHIP.dot} size="small">
      {ARCHIVED_CHIP.label}
    </KkChip>
  ) : undefined;

  const note =
    archivedMeta === undefined ? undefined : (
      <Stack sx={{ gap: 0.5, minWidth: 0 }}>
        <KkMeta>{archivedMeta}</KkMeta>
        <KkNote>{ARCHIVED_NOTE}</KkNote>
      </Stack>
    );

  const actions = isArchived ? (
    <KkButton size="small" variant="outlined" onClick={onRestore} loading={isRestoring}>
      {RESTORE_LABEL}
    </KkButton>
  ) : (
    <>
      <KkButton
        size="small"
        variant="outlined"
        startIcon={<KkIcon name="edit" size="small" />}
        onClick={onRename}
      >
        {RENAME_LABEL}
      </KkButton>
      <KkButton
        size="small"
        variant="outlined"
        startIcon={<KkIcon name="archive" size="small" />}
        onClick={onArchive}
      >
        {ARCHIVE_LABEL}
      </KkButton>
    </>
  );

  return (
    <AppRecordHeaderCard
      eyebrow={EYEBROW}
      title={role.name}
      chips={chips}
      description={description}
      note={note}
      actions={actions}
      dimmed={isArchived}
    />
  );
};
