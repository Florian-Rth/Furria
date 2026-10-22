import { KkFactRow } from '@furria/ui/KkFactRow';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSinceRow } from '@furria/ui/KkSinceRow';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { formatPeriod, formatSinceSession } from '@/lib/membership-labels';
import { splitPersonGroups, splitPersonRoles } from '../manage-persons-labels';
import { toSectionLandingKey } from '../person-identity';
import type { PersonDetails } from '../schemas';

const TITLE = 'Gruppen & Rollen';
const POINTER =
  'Gruppen pflegen die Gruppen-Admins, Rollen und Vorstand werden unter „Rollen & Rechte“ vergeben.';
const SINCE_LABEL = 'seit';
const PAST_META = 'früher';
const GROUP_PATH = '/groups/$groupId';
const ROLES_PATH = '/manage/roles';
const BOARD_OFFICE_PATH = '/manage/board/$boardOfficeId';

interface PersonTiesPanelProps {
  person: PersonDetails;
  highlightedKey: string | null;
}

export const PersonTiesPanel: FC<PersonTiesPanelProps> = ({ person, highlightedKey }) => {
  const { has, isAffiliated } = usePermissions();
  const groups = splitPersonGroups(person.groups);
  const roles = splitPersonRoles(person.roles);
  const mayOpenRole = has(PERMISSION_KEYS.rolesManage);
  const mayOpenBoard = has(PERMISSION_KEYS.boardManage);

  const groupRows = groups.running.map((group) => {
    const linkProps = isAffiliated
      ? { component: Link, to: GROUP_PATH, params: { groupId: String(group.groupId) } }
      : {};

    return (
      <KkSinceRow
        key={`group-${group.groupId}-${group.joinedOn}`}
        icon="group"
        title={group.name}
        sinceLabel={SINCE_LABEL}
        sinceValue={formatSinceSession(group.joinedOn)}
        {...linkProps}
      />
    );
  });

  const roleRows = roles.running.map((role) => {
    const linkProps = mayOpenRole
      ? { component: Link, to: ROLES_PATH, search: { role: role.roleId } }
      : {};

    return (
      <KkSinceRow
        key={`role-${role.roleId}-${role.sinceOn}`}
        icon="role"
        tone="accent"
        title={role.name}
        sinceLabel={SINCE_LABEL}
        sinceValue={formatSinceSession(role.sinceOn)}
        {...linkProps}
      />
    );
  });

  const seatRows = person.unendedBoardSeats.map((seat) => {
    const linkProps = mayOpenBoard
      ? {
          component: Link,
          to: BOARD_OFFICE_PATH,
          params: { boardOfficeId: String(seat.boardOfficeId) },
        }
      : {};

    return (
      <KkSinceRow
        key={`seat-${seat.boardOfficeId}-${seat.sinceOn}`}
        icon="board"
        tone="accent"
        title={seat.name}
        sinceLabel={SINCE_LABEL}
        sinceValue={formatSinceSession(seat.sinceOn)}
        {...linkProps}
      />
    );
  });

  const pastRows = [
    ...groups.past.map((group) => (
      <KkFactRow
        key={`group-${group.groupId}-${group.joinedOn}`}
        title={group.name}
        span={formatPeriod(group.joinedOn, group.leftOn)}
      />
    )),
    ...roles.past.map((role) => (
      <KkFactRow
        key={`role-${role.roleId}-${role.sinceOn}`}
        title={role.name}
        span={formatPeriod(role.sinceOn, role.untilOn)}
      />
    )),
  ];

  const runningRows = [...groupRows, ...roleRows, ...seatRows];
  const landingKey = toSectionLandingKey('ties', person.personId);
  const runningPanel =
    runningRows.length === 0 ? null : (
      <KkPanel highlight={highlightedKey === landingKey} landing={landingKey}>
        {runningRows}
      </KkPanel>
    );
  const pastPanel =
    pastRows.length === 0 ? null : (
      <Stack sx={{ gap: 0.75, minWidth: 0 }}>
        <KkNote tone="muted">{PAST_META}</KkNote>
        <KkPanel>{pastRows}</KkPanel>
      </Stack>
    );

  return (
    <KkPanelSection title={TITLE} description={POINTER}>
      <Stack sx={{ gap: 1.25, minWidth: 0 }}>
        {runningPanel}
        {pastPanel}
      </Stack>
    </KkPanelSection>
  );
};
