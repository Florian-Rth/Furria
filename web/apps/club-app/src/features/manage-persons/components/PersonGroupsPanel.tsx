import { KkEmptyState, KkFactRow, KkNote, KkPanel, KkPanelSection, KkSinceRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { formatPeriod, formatSinceSession } from '@/lib/membership-labels';
import { GROUPS_POINTER, PERSON_SECTION_TITLES, splitPersonGroups } from '../manage-persons-labels';
import type { PersonGroup } from '../schemas';

const EMPTY_TITLE = 'IN KEINER GRUPPE';
const SINCE_LABEL = 'seit';
const PAST_META = 'früher';
const GROUP_PATH = '/groups/$groupId';

interface PersonGroupsPanelProps {
  groups: readonly PersonGroup[];
  firstName: string;
}

export const PersonGroupsPanel: FC<PersonGroupsPanelProps> = ({ groups, firstName }) => {
  const { isAffiliated } = usePermissions();
  const { running, past } = splitPersonGroups(groups);

  const runningRows = running.map((group) => {
    const linkProps = isAffiliated
      ? { component: Link, to: GROUP_PATH, params: { groupId: String(group.groupId) } }
      : {};

    return (
      <KkSinceRow
        key={`${group.groupId}-${group.joinedOn}`}
        icon="group"
        title={group.name}
        sinceLabel={SINCE_LABEL}
        sinceValue={formatSinceSession(group.joinedOn)}
        {...linkProps}
      />
    );
  });

  const pastRows = past.map((group) => (
    <KkFactRow
      key={`${group.groupId}-${group.joinedOn}`}
      title={group.name}
      span={formatPeriod(group.joinedOn, group.leftOn)}
    />
  ));

  const isEmpty = runningRows.length === 0;

  const runningPanel = isEmpty ? (
    <KkPanel variant="block">
      <KkEmptyState
        size="panel"
        title={EMPTY_TITLE}
        description={`${firstName} tanzt und spielt gerade in keiner Gruppe mit.`}
      />
    </KkPanel>
  ) : (
    <KkPanel>{runningRows}</KkPanel>
  );

  const pastPanel =
    pastRows.length === 0 ? null : (
      <Stack sx={{ gap: 0.75, minWidth: 0 }}>
        <KkNote tone="muted">{PAST_META}</KkNote>
        <KkPanel>{pastRows}</KkPanel>
      </Stack>
    );

  return (
    <KkPanelSection title={PERSON_SECTION_TITLES.groups} description={GROUPS_POINTER}>
      <Stack sx={{ gap: 1.25, minWidth: 0 }}>
        {runningPanel}
        {pastPanel}
      </Stack>
    </KkPanelSection>
  );
};
