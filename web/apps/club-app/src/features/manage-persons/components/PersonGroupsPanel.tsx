import { KkChip, KkEmptyState, KkFactRow, KkNote, KkPanel, KkSinceRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { formatPeriod, formatSinceSession } from '@/lib/membership-labels';
import {
  GROUPS_POINTER,
  PERSON_SECTION_TITLES,
  READ_ONLY_CHIP_LABEL,
  splitPersonGroups,
} from '../manage-persons-labels';
import type { PersonGroup } from '../schemas';
import { PersonSection } from './PersonSection';

const EMPTY_TITLE = 'IN KEINER GRUPPE';
const SINCE_LABEL = 'seit';
const PAST_META = 'früher';

interface PersonGroupsPanelProps {
  groups: readonly PersonGroup[];
  firstName: string;
}

export const PersonGroupsPanel: FC<PersonGroupsPanelProps> = ({ groups, firstName }) => {
  const { running, past } = splitPersonGroups(groups);

  const runningRows = running.map((group) => (
    <KkSinceRow
      key={`${group.groupId}-${group.joinedOn}`}
      icon="group"
      title={group.name}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatSinceSession(group.joinedOn)}
    />
  ));

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

  const chip = <KkChip tone="neutral">{READ_ONLY_CHIP_LABEL}</KkChip>;

  return (
    <PersonSection title={PERSON_SECTION_TITLES.groups} action={chip}>
      <Stack sx={{ gap: 1.25, minWidth: 0 }}>
        {runningPanel}
        {pastPanel}
        <KkNote>{GROUPS_POINTER}</KkNote>
      </Stack>
    </PersonSection>
  );
};
