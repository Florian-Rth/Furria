import { KkButton, KkChip, KkHeading, KkIcon, KkMeta, KkNote, KkPanel, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  toArchivedSinceLine,
  toGroupCountLine,
  toManagedGroupChips,
} from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';

const EDIT_LABEL = 'Bearbeiten';
const ARCHIVE_LABEL = 'Archivieren';
const RESTORE_LABEL = 'Aktivieren';
const NO_DESCRIPTION_LINE = 'Zu dieser Gruppe steht noch nichts geschrieben.';

interface ManagedGroupHeaderCardProps {
  group: ManagedGroupSummary;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export const ManagedGroupHeaderCard: FC<ManagedGroupHeaderCardProps> = ({
  group,
  onEdit,
  onArchive,
  onRestore,
}) => {
  const chips = toManagedGroupChips(group);
  const isArchived = group.archivedOn !== null;

  const statusChip =
    chips.status === null ? null : (
      <KkChip tone={chips.status.tone} dot={chips.status.dot} size="small">
        {chips.status.label}
      </KkChip>
    );

  const description =
    group.description.trim() === '' ? (
      <KkMeta italic>{NO_DESCRIPTION_LINE}</KkMeta>
    ) : (
      <KkText>{group.description}</KkText>
    );

  const archivedNote =
    group.archivedOn === null ? null : <KkNote>{toArchivedSinceLine(group.archivedOn)}</KkNote>;

  const editAction = isArchived ? null : (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="edit" size="small" />}
      onClick={onEdit}
    >
      {EDIT_LABEL}
    </KkButton>
  );

  const statusAction = isArchived ? (
    <KkButton size="small" variant="outlined" onClick={onRestore}>
      {RESTORE_LABEL}
    </KkButton>
  ) : (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="archive" size="small" />}
      onClick={onArchive}
    >
      {ARCHIVE_LABEL}
    </KkButton>
  );

  return (
    <KkPanel variant="block" dimmed={isArchived}>
      <Stack sx={{ gap: 1.75, minWidth: 0 }}>
        <Stack sx={{ gap: 0.5, minWidth: 0 }}>
          <KkHeading level={2}>{group.name}</KkHeading>
          <KkMeta>{toGroupCountLine(group)}</KkMeta>
        </Stack>
        <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
          {statusChip}
          <KkChip tone={chips.openness.tone} dot={chips.openness.dot} size="small">
            {chips.openness.label}
          </KkChip>
        </Stack>
        {description}
        {archivedNote}
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', minWidth: 0 }}>
          {editAction}
          {statusAction}
        </Stack>
      </Stack>
    </KkPanel>
  );
};
