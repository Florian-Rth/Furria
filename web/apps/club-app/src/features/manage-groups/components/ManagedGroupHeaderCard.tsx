import { KkButton, KkChip, KkIcon, KkMeta, KkNote, KkText } from '@furria/ui';
import type { FC } from 'react';
import { AppRecordHeaderCard } from '@/features/session';
import { toArchivedSinceLine, toManagedGroupChips } from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';

const EYEBROW = 'Gruppe';
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
  const chipSet = toManagedGroupChips(group);
  const isArchived = group.archivedOn !== null;

  const statusChip =
    chipSet.status === null ? null : (
      <KkChip tone={chipSet.status.tone} dot={chipSet.status.dot} size="small">
        {chipSet.status.label}
      </KkChip>
    );

  const chips = (
    <>
      {statusChip}
      <KkChip tone={chipSet.openness.tone} dot={chipSet.openness.dot} size="small">
        {chipSet.openness.label}
      </KkChip>
    </>
  );

  const description =
    group.description.trim() === '' ? (
      <KkMeta italic>{NO_DESCRIPTION_LINE}</KkMeta>
    ) : (
      <KkText>{group.description}</KkText>
    );

  const note =
    group.archivedOn === null ? undefined : (
      <KkNote>{toArchivedSinceLine(group.archivedOn)}</KkNote>
    );

  const actions = isArchived ? (
    <KkButton size="small" variant="outlined" onClick={onRestore}>
      {RESTORE_LABEL}
    </KkButton>
  ) : (
    <>
      <KkButton
        size="small"
        variant="outlined"
        startIcon={<KkIcon name="edit" size="small" />}
        onClick={onEdit}
      >
        {EDIT_LABEL}
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
      title={group.name}
      chips={chips}
      description={description}
      note={note}
      actions={actions}
      dimmed={isArchived}
    />
  );
};
