import {
  KkButton,
  KkChip,
  KkEyebrow,
  KkHeading,
  KkMeta,
  KkNote,
  KkPanel,
  KkText,
} from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
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

  const metaLine = archivedMeta === undefined ? null : <KkMeta>{archivedMeta}</KkMeta>;

  const description =
    role.description === '' ? (
      <KkMeta italic>{toNoDescriptionLine(role.name)}</KkMeta>
    ) : (
      <KkText variant="body2">{role.description}</KkText>
    );

  const chip = isArchived ? (
    <KkChip tone={ARCHIVED_CHIP.tone} dot={ARCHIVED_CHIP.dot} size="small">
      {ARCHIVED_CHIP.label}
    </KkChip>
  ) : null;

  const actions = isArchived ? (
    <KkButton variant="outlined" onClick={onRestore} loading={isRestoring}>
      {RESTORE_LABEL}
    </KkButton>
  ) : (
    <>
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
          <KkEyebrow tone="accent">{EYEBROW}</KkEyebrow>
          {chip}
        </Stack>
        <KkHeading level={3}>{role.name}</KkHeading>
        {metaLine}
        {description}
        {archivedNote}
        <Stack direction="row" sx={{ gap: 1.25, minWidth: 0, flexWrap: 'wrap', pt: 0.5 }}>
          {actions}
        </Stack>
      </Stack>
    </KkPanel>
  );
};
