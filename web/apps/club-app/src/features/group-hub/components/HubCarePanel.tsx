import type { KkPanelAction } from '@furria/ui';
import { KkFieldRow, KkPanel, KkPanelSection, KkSwitchRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { RunningGroupKind } from '@/features/group-kinds';
import { GROUP_KIND_FIELD_LABEL, NO_GROUP_KIND_LABEL } from '@/features/group-kinds';
import type { GroupTone } from '@/features/groups';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { toToneLabel } from '../group-hub-labels';
import { useRecruitingSwitch } from '../hooks/use-recruiting-switch';
import type { GroupHub } from '../schemas';

const EDIT_LABEL = 'Bearbeiten';
const EDIT_ACTION_LABEL = 'Angaben zur Gruppe bearbeiten';
const FOUNDED_LABEL = 'Gründungsjahr';
const NO_FOUNDED_YEAR = 'noch offen';
const NO_TONE_LABEL = 'noch keine';
const TONE_FIELD_LABEL = 'Gruppenfarbe';
const OPENNESS_LABEL = 'Sucht Verstärkung';
const OPENNESS_DESCRIPTION = 'Zeigt im Verzeichnis, dass ihr gerade Leute aufnehmt.';
const EDIT_ROUTE = '/groups/$groupId/edit';

interface HubCarePanelProps {
  hub: GroupHub;
  tone: GroupTone;
  heldKind: RunningGroupKind | null;
}

export const HubCarePanel: FC<HubCarePanelProps> = ({ hub, tone, heldKind }) => {
  const recruiting = useRecruitingSwitch(hub);
  const kindLine = heldKind === null ? NO_GROUP_KIND_LABEL : heldKind.name;
  const foundedLine = hub.foundedYear === null ? NO_FOUNDED_YEAR : String(hub.foundedYear);
  const toneLine = hub.tone === null ? NO_TONE_LABEL : toToneLabel(hub.tone);

  const action: KkPanelAction = {
    label: EDIT_LABEL,
    icon: 'edit',
    ariaLabel: EDIT_ACTION_LABEL,
    component: Link,
    to: EDIT_ROUTE,
    params: { groupId: String(hub.groupId) },
  };

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.care} groupTone={tone} action={action}>
      <KkPanel>
        <KkFieldRow label={GROUP_KIND_FIELD_LABEL} value={kindLine} />
        <KkFieldRow label={FOUNDED_LABEL} value={foundedLine} />
        <KkFieldRow label={TONE_FIELD_LABEL} value={toneLine} />
        <KkSwitchRow
          label={OPENNESS_LABEL}
          checked={recruiting.checked}
          onChange={recruiting.onChange}
          description={OPENNESS_DESCRIPTION}
          busy={recruiting.busy}
        />
      </KkPanel>
    </KkPanelSection>
  );
};
