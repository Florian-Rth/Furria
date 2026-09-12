import {
  KkChip,
  KkEmptyState,
  KkFactRow,
  KkNote,
  KkPanel,
  KkPanelSection,
  KkSinceRow,
} from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { formatPeriod, formatSinceSession } from '@/lib/membership-labels';
import { READ_ONLY_CHIP } from '@/lib/state-chips';
import { PERSON_SECTION_TITLES, ROLES_POINTER, splitPersonRoles } from '../manage-persons-labels';
import type { PersonRole } from '../schemas';

const EMPTY_TITLE = 'KEINE ROLLE';
const SINCE_LABEL = 'Inhaberin seit';
const PAST_META = 'früher';
const ROLES_PATH = '/manage/roles';

interface PersonRolesPanelProps {
  roles: readonly PersonRole[];
  firstName: string;
}

export const PersonRolesPanel: FC<PersonRolesPanelProps> = ({ roles, firstName }) => {
  const { has } = usePermissions();
  const { running, past } = splitPersonRoles(roles);
  const mayOpenRole = has(PERMISSION_KEYS.rolesManage);

  const runningRows = running.map((role) => {
    const linkProps = mayOpenRole
      ? { component: Link, to: ROLES_PATH, search: { role: role.roleId } }
      : {};

    return (
      <KkSinceRow
        key={`${role.roleId}-${role.sinceOn}`}
        icon="role"
        tone="accent"
        title={role.name}
        sinceLabel={SINCE_LABEL}
        sinceValue={formatSinceSession(role.sinceOn)}
        {...linkProps}
      />
    );
  });

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
        size="panel"
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

  const readOnlyChip = (
    <KkChip tone={READ_ONLY_CHIP.tone} dot={READ_ONLY_CHIP.dot}>
      {READ_ONLY_CHIP.label}
    </KkChip>
  );

  return (
    <KkPanelSection
      title={PERSON_SECTION_TITLES.roles}
      meta={readOnlyChip}
      description={ROLES_POINTER}
    >
      <Stack sx={{ gap: 1.25, minWidth: 0 }}>
        {runningPanel}
        {pastPanel}
      </Stack>
    </KkPanelSection>
  );
};
