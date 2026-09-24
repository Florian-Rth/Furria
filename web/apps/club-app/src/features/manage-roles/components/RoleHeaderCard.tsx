import { KkButton, KkChip, KkIcon, KkMeta, KkNote, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppRecordHeaderCard } from '@/features/session';
import { ARCHIVED_CHIP } from '@/lib/state-chips';
import { toArchivedMeta, toNoDescriptionLine } from '../manage-roles-labels';
import type { RoleDetails } from '../schemas';

const EYEBROW = 'Rolle';
const EDIT_LABEL = 'Bearbeiten';
const EDIT_ACTION_LABEL = 'Rolle bearbeiten';
const RESTORE_LABEL = 'Aktivieren';
const EDIT_ROUTE = '/manage/roles/$roleId/edit';
const ARCHIVED_NOTE =
  'Diese Rolle ist archiviert, ihre Rechte gelten nicht. Aktiviere sie, um sie zu bearbeiten.';

interface RoleHeaderCardProps {
  role: RoleDetails;
  onOpenRestore: () => void;
  isRestoring: boolean;
}

export const RoleHeaderCard: FC<RoleHeaderCardProps> = ({ role, onOpenRestore, isRestoring }) => {
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
    <KkButton size="small" variant="outlined" onClick={onOpenRestore} loading={isRestoring}>
      {RESTORE_LABEL}
    </KkButton>
  ) : (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="edit" size="small" />}
      ariaLabel={EDIT_ACTION_LABEL}
      component={Link}
      to={EDIT_ROUTE}
      params={{ roleId: String(role.roleId) }}
    >
      {EDIT_LABEL}
    </KkButton>
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
