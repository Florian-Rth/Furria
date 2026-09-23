import type { KkPanelAction } from '@furria/ui';
import {
  KkConfirmDialog,
  KkFieldRow,
  KkNote,
  KkPanel,
  KkPanelSection,
  KkWriteScreen,
} from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { useGroupKindArchive } from '../hooks/use-group-kind-archive';
import type { GroupKindEntry } from '../manage-groups-labels';
import {
  ARCHIVE_GROUP_KIND_EXPLANATION,
  ARCHIVE_GROUP_KIND_EYEBROW,
  GROUP_KIND_SECTION_TITLE,
  isGroupKindArchivable,
  toArchiveGroupKindConsequence,
  toArchiveGroupKindQuestion,
  toGroupKindFacts,
  toGroupKindLockedReason,
  toGroupKindUsageLine,
} from '../manage-groups-labels';

const NAME_LABEL = 'Name';
const USAGE_LABEL = 'Gruppen';
const EDIT_LABEL = 'Bearbeiten';
const EDIT_ARIA_LABEL = 'Gruppenart bearbeiten';
const ARCHIVE_LABEL = 'Gruppenart archivieren';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';
const EDIT_ROUTE = '/manage/groups/kinds/$groupKindId/edit';

interface GroupKindPageProps {
  entry: GroupKindEntry;
  highlight: boolean;
}

export const GroupKindPage: FC<GroupKindPageProps> = ({ entry, highlight }) => {
  const archive = useGroupKindArchive(entry);
  const canArchive = isGroupKindArchivable(entry);
  const today = formatIsoDay(toIsoDay(new Date()));

  const action: KkPanelAction = {
    label: EDIT_LABEL,
    icon: 'edit',
    ariaLabel: EDIT_ARIA_LABEL,
    component: Link,
    to: EDIT_ROUTE,
    params: { groupKindId: String(entry.groupKindId) },
  };

  const dangerOrNote = canArchive ? (
    <>
      <KkWriteScreen.Danger label={ARCHIVE_LABEL} onSelect={archive.open} />
      <KkConfirmDialog
        open={archive.isOpen}
        onClose={archive.close}
        onConfirm={archive.submit}
        tone="danger"
        eyebrow={ARCHIVE_GROUP_KIND_EYEBROW}
        question={toArchiveGroupKindQuestion(entry.name)}
        explanation={ARCHIVE_GROUP_KIND_EXPLANATION}
        facts={toGroupKindFacts(entry, today)}
        consequence={toArchiveGroupKindConsequence(entry.name, today)}
        error={archive.rejection ?? undefined}
        confirmLabel={ARCHIVE_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={archive.isSaving}
      />
    </>
  ) : (
    <KkNote>{toGroupKindLockedReason(entry.groupCount)}</KkNote>
  );

  return (
    <KkPanelSection title={GROUP_KIND_SECTION_TITLE} action={action}>
      <KkPanel highlight={highlight} landing={toLandingKey('group-kind', entry.groupKindId)}>
        <KkFieldRow label={NAME_LABEL} value={entry.name} />
        <KkFieldRow label={USAGE_LABEL} value={toGroupKindUsageLine(entry.groupCount)} />
      </KkPanel>
      {dangerOrNote}
    </KkPanelSection>
  );
};
