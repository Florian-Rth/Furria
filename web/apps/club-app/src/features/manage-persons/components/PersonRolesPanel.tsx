import { KkChip, KkEmptyState, KkFactRow, KkNote, KkPanel, KkSinceRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { formatPeriod, formatSinceSession } from '@/lib/membership-labels';
import {
  PERSON_SECTION_TITLES,
  READ_ONLY_CHIP_LABEL,
  ROLES_POINTER,
  splitPersonRoles,
} from '../manage-persons-labels';
import type { PersonRole } from '../schemas';
import { PersonSection } from './PersonSection';

const EMPTY_TITLE = 'KEINE ROLLE';
const SINCE_LABEL = 'Inhaberin seit';
const PAST_META = 'früher';

interface PersonRolesPanelProps {
  roles: readonly PersonRole[];
  firstName: string;
}

export const PersonRolesPanel: FC<PersonRolesPanelProps> = ({ roles, firstName }) => {
  const { running, past } = splitPersonRoles(roles);

  const runningRows = running.map((role) => (
    <KkSinceRow
      key={`${role.roleId}-${role.sinceOn}`}
      icon="role"
      tone="accent"
      title={role.name}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatSinceSession(role.sinceOn)}
    />
  ));

  const pastRows = past.map((role) => (
    <KkFactRow
      key={`${role.roleId}-${role.sinceOn}`}
      title={role.name}
      span={formatPeriod(role.sinceOn, role.untilOn)}
    />
  ));

  const isEmpty = runningRows.length === 0;

  const runningPanel = isEmpty ? (
    <KkPanel variant="block">
      <KkEmptyState
        icon="role"
        title={EMPTY_TITLE}
        description={`${firstName} trägt gerade keine Rolle im Verein.`}
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
    <PersonSection title={PERSON_SECTION_TITLES.roles} action={chip}>
      <Stack sx={{ gap: 1.25, minWidth: 0 }}>
        {runningPanel}
        {pastPanel}
        <KkNote>{ROLES_POINTER}</KkNote>
      </Stack>
    </PersonSection>
  );
};
