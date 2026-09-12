import {
  KkButton,
  KkChip,
  KkEyebrow,
  KkHeading,
  KkIcon,
  KkMeta,
  KkNote,
  KkPanel,
} from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toArchivedMeta, toNoDescriptionLine, toRightsCountLabel } from '../manage-roles-labels';
import type { RoleDetails } from '../schemas';

const EYEBROW = 'Rolle';
const ARCHIVED_LABEL = 'archiviert';
const RENAME_LABEL = 'Umbenennen';
const ADD_HOLDER_LABEL = 'Inhaber eintragen';
const ARCHIVE_LABEL = 'Archivieren';
const RESTORE_LABEL = 'Aktivieren';
const ARCHIVED_NOTE =
  'Diese Rolle ist archiviert. Ihre Rechte greifen nicht mehr, und sie lässt sich erst nach dem Aktivieren wieder bearbeiten.';

interface RoleHeaderCardProps {
  role: RoleDetails;
  onRename: () => void;
  onAddHolder: () => void;
  onArchive: () => void;
  onRestore: () => void;
  isRestoring: boolean;
}

export const RoleHeaderCard: FC<RoleHeaderCardProps> = ({
  role,
  onRename,
  onAddHolder,
  onArchive,
  onRestore,
  isRestoring,
}) => {
  const isArchived = role.archivedOn !== null;
  const archivedMeta = toArchivedMeta(role.archivedOn);
  const rightsLine = toRightsCountLabel(role.permissionKeys.length);

  const description =
    role.description === '' ? (
      <KkMeta italic>{toNoDescriptionLine(role.name)}</KkMeta>
    ) : (
      <KkNote>{role.description}</KkNote>
    );

  const chip = isArchived ? <KkChip size="small">{ARCHIVED_LABEL}</KkChip> : null;
  const metaLine = archivedMeta === undefined ? rightsLine : `${rightsLine} · ${archivedMeta}`;

  const actions = isArchived ? (
    <KkButton variant="outlined" onClick={onRestore} loading={isRestoring}>
      {RESTORE_LABEL}
    </KkButton>
  ) : (
    <>
      <KkButton
        startIcon={<KkIcon name="add" size="small" />}
        onClick={onAddHolder}
        sx={{ flexShrink: 0 }}
      >
        {ADD_HOLDER_LABEL}
      </KkButton>
      <KkButton variant="outlined" onClick={onRename}>
        {RENAME_LABEL}
      </KkButton>
      <KkButton variant="outlined" onClick={onArchive}>
        {ARCHIVE_LABEL}
      </KkButton>
    </>
  );

  const archivedNote = isArchived ? <KkNote tone="warning">{ARCHIVED_NOTE}</KkNote> : null;

  return (
    <KkPanel variant="block">
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        <Stack direction="row" sx={{ gap: 1, minWidth: 0, alignItems: 'center', flexWrap: 'wrap' }}>
          <KkEyebrow>{EYEBROW}</KkEyebrow>
          {chip}
        </Stack>
        <KkHeading level={2}>{role.name}</KkHeading>
        <KkMeta>{metaLine}</KkMeta>
        {description}
        {archivedNote}
        <Stack direction="row" sx={{ gap: 1.25, minWidth: 0, flexWrap: 'wrap', pt: 0.5 }}>
          {actions}
        </Stack>
      </Stack>
    </KkPanel>
  );
};
