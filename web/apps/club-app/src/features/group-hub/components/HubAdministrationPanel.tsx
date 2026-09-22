import type { KkPanelAction } from '@furria/ui';
import { KkConfirmDialog, KkFieldRow, KkPanel, KkPanelSection, KkWriteScreen } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { GROUP_KIND_FIELD_LABEL, NO_GROUP_KIND_LABEL } from '@/features/group-kinds';
import type { GroupTone } from '@/features/groups';
import { toIsoDay } from '@/lib/day';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { formatIsoDay } from '@/lib/membership-labels';
import {
  ARCHIVE_GROUP_EXPLANATION,
  ARCHIVE_GROUP_EYEBROW,
  toArchiveGroupConsequence,
  toArchiveGroupFacts,
  toArchiveGroupQuestion,
} from '../group-hub-labels';
import { useGroupArchive } from '../hooks/use-group-archive';
import type { GroupHub } from '../schemas';

const EDIT_LABEL = 'Bearbeiten';
const EDIT_ACTION_LABEL = 'Name und Gruppenart bearbeiten';
const NAME_LABEL = 'Name';
const ARCHIVE_LABEL = 'Gruppe archivieren';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';
const ADMINISTRATION_ROUTE = '/groups/$groupId/administration';

interface HubAdministrationPanelProps {
  hub: GroupHub;
  tone: GroupTone;
}

export const HubAdministrationPanel: FC<HubAdministrationPanelProps> = ({ hub, tone }) => {
  const archive = useGroupArchive(hub);
  const today = formatIsoDay(toIsoDay(new Date()));
  const kindLine = hub.groupKindName ?? NO_GROUP_KIND_LABEL;

  const action: KkPanelAction = {
    label: EDIT_LABEL,
    icon: 'edit',
    ariaLabel: EDIT_ACTION_LABEL,
    component: Link,
    to: ADMINISTRATION_ROUTE,
    params: { groupId: String(hub.groupId) },
  };

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.administration} groupTone={tone} action={action}>
      <KkPanel>
        <KkFieldRow label={NAME_LABEL} value={hub.name} />
        <KkFieldRow label={GROUP_KIND_FIELD_LABEL} value={kindLine} />
      </KkPanel>
      <KkWriteScreen.Danger label={ARCHIVE_LABEL} onSelect={archive.open} />
      <KkConfirmDialog
        open={archive.isOpen}
        onClose={archive.close}
        onConfirm={archive.submit}
        tone="danger"
        eyebrow={ARCHIVE_GROUP_EYEBROW}
        question={toArchiveGroupQuestion(hub.name)}
        explanation={ARCHIVE_GROUP_EXPLANATION}
        facts={toArchiveGroupFacts(hub, today)}
        consequence={toArchiveGroupConsequence(hub.name, hub.members.length, today)}
        error={archive.rejection ?? undefined}
        confirmLabel={ARCHIVE_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={archive.isSaving}
      />
    </KkPanelSection>
  );
};
