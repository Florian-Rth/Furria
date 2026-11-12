import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { KkPanelAction } from '@furria/ui/panel-action';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  GROUP_KIND_FIELD_LABEL,
  NO_GROUP_KIND_LABEL,
} from '@/features/group-kinds/group-kinds-labels';
import type { RunningGroupKind } from '@/features/group-kinds/schemas';
import { GroupMatcherHubRow } from '@/features/group-matcher/components/GroupMatcherHubRow';
import type { GroupTone } from '@/features/groups/group-identity';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { useRecruitingSwitch } from '../hooks/use-recruiting-switch';
import type { GroupHub } from '../schemas';
import { HubArchiveAction } from './HubArchiveAction';
import { HubToneValue } from './HubToneValue';

const EDIT_LABEL = 'Bearbeiten';
const EDIT_ACTION_LABEL = 'Angaben zur Gruppe bearbeiten';
const FOUNDED_LABEL = 'Gründungsjahr';
const NO_FOUNDED_YEAR = 'noch offen';
const TONE_FIELD_LABEL = 'Gruppenfarbe';
const OPENNESS_LABEL = 'Sucht Verstärkung';
const RENAME_LABEL = 'Name und Gruppenart';
const EDIT_ROUTE = '/groups/$groupId/edit';

const toAdministrationPath = (groupId: number): string => `/groups/${groupId}/administration`;

interface HubSettingsPanelProps {
  hub: GroupHub;
  tone: GroupTone;
  heldKind: RunningGroupKind | null;
  administers: boolean;
}

export const HubSettingsPanel: FC<HubSettingsPanelProps> = ({
  hub,
  tone,
  heldKind,
  administers,
}) => {
  const recruiting = useRecruitingSwitch(hub);
  const params = { groupId: String(hub.groupId) };
  const kindLine = heldKind === null ? NO_GROUP_KIND_LABEL : heldKind.name;
  const foundedLine = hub.foundedYear === null ? NO_FOUNDED_YEAR : String(hub.foundedYear);

  const action: KkPanelAction | undefined = hub.viewerMayManage
    ? {
        label: EDIT_LABEL,
        icon: 'edit',
        ariaLabel: EDIT_ACTION_LABEL,
        component: Link,
        to: EDIT_ROUTE,
        params,
      }
    : undefined;

  const facts = hub.viewerMayManage ? (
    <KkPanel>
      <KkFieldRow label={GROUP_KIND_FIELD_LABEL} value={kindLine} />
      <KkFieldRow label={FOUNDED_LABEL} value={foundedLine} />
      <KkFieldRow label={TONE_FIELD_LABEL} value={<HubToneValue tone={hub.tone} />} />
      <KkSwitchRow
        label={OPENNESS_LABEL}
        checked={recruiting.checked}
        onChange={recruiting.onChange}
        busy={recruiting.busy}
      />
    </KkPanel>
  ) : null;

  const groupMatcher =
    hub.groupMatcher === null ? null : (
      <GroupMatcherHubRow groupId={hub.groupId} status={hub.groupMatcher} />
    );

  const administration = administers ? (
    <>
      <KkPanel>
        <KkHubRow
          label={RENAME_LABEL}
          icon="manage"
          component={Link}
          to={toAdministrationPath(hub.groupId)}
        />
      </KkPanel>
      <HubArchiveAction hub={hub} />
    </>
  ) : null;

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.settings} groupTone={tone} action={action}>
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        {facts}
        {groupMatcher}
        {administration}
      </Stack>
    </KkPanelSection>
  );
};
