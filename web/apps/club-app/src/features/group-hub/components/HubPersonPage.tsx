import { KkFactRow, KkNote, KkPanel, KkPanelSection, KkScreen } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';
import { AREA_HANDOVERS, usePermissions } from '@/features/session';
import { toInitials } from '@/lib/initials';
import { formatPeriod } from '@/lib/membership-labels';
import {
  PERSON_SCREEN_ADD_ADMIN_LABEL,
  PERSON_SCREEN_ADD_MEMBERSHIP_LABEL,
  PERSON_SCREEN_CONTACT_NOTE,
  PERSON_SCREEN_UNREACHABLE_NOTE,
  toHubEditorOrigin,
} from '../group-hub-labels';
import { toHubPeople, toHubPortrait, toPrefillPerson } from '../hub-people';
import type { GroupHub } from '../schemas';
import { HubPersonHeader } from './HubPersonHeader';

const NEW_MEMBERSHIP_ROUTE = '/groups/$groupId/memberships/new';
const NEW_ADMIN_ROUTE = '/groups/$groupId/admins/new';
const MEMBERSHIP_ROUTE = '/groups/$groupId/memberships/$membershipId';
const ADMIN_ROUTE = '/groups/$groupId/admins/$adminId';
const MEMBERSHIP_SECTION_TITLE = 'Zugehörigkeit';
const ADMIN_SECTION_TITLE = 'Gruppen-Admin';

interface HubPersonPageProps {
  hub: GroupHub;
  personId: number;
}

export const HubPersonPage: FC<HubPersonPageProps> = ({ hub, personId }) => {
  const { isAffiliated } = usePermissions();
  const people = toHubPeople(hub.members, hub.admins);
  const person = toPrefillPerson(people, personId);
  const portrait = toHubPortrait(people, personId);
  const name = person === null ? '' : `${person.firstName} ${person.lastName}`;
  const initials = toInitials(person?.firstName ?? '', person?.lastName ?? '');
  const canOpenProfile = isAffiliated && hub.members.some((member) => member.personId === personId);

  const runningMembership = hub.members.find((member) => member.personId === personId) ?? null;
  const pastMemberships = hub.pastMembers.filter((member) => member.personId === personId);
  const runningAdmin = hub.admins.find((admin) => admin.personId === personId) ?? null;
  const pastAdmins = hub.pastAdmins.filter((admin) => admin.personId === personId);

  const membershipRows: ReactNode[] = [];

  if (runningMembership === null) {
    membershipRows.push(
      <KkFactRow
        key="new-membership"
        title={PERSON_SCREEN_ADD_MEMBERSHIP_LABEL}
        span=""
        component={Link}
        to={NEW_MEMBERSHIP_ROUTE}
        params={{ groupId: String(hub.groupId) }}
        search={{ person: String(personId) }}
      />,
    );
  } else {
    membershipRows.push(
      <KkFactRow
        key={runningMembership.groupMembershipId}
        title={formatPeriod(runningMembership.joinedOn, null)}
        span=""
        component={Link}
        to={MEMBERSHIP_ROUTE}
        params={{
          groupId: String(hub.groupId),
          membershipId: String(runningMembership.groupMembershipId),
        }}
      />,
    );
  }
  for (const past of pastMemberships) {
    membershipRows.push(
      <KkFactRow
        key={past.groupMembershipId}
        title={formatPeriod(past.joinedOn, past.leftOn)}
        span=""
      />,
    );
  }

  const adminRows: ReactNode[] = [];

  if (runningAdmin === null) {
    adminRows.push(
      <KkFactRow
        key="new-admin"
        title={PERSON_SCREEN_ADD_ADMIN_LABEL}
        span=""
        component={Link}
        to={NEW_ADMIN_ROUTE}
        params={{ groupId: String(hub.groupId) }}
        search={{ person: String(personId) }}
      />,
    );
  } else {
    adminRows.push(
      <KkFactRow
        key={runningAdmin.groupAdminId}
        title={formatPeriod(runningAdmin.sinceOn, null)}
        span=""
        meta={runningAdmin.function ?? undefined}
        component={Link}
        to={ADMIN_ROUTE}
        params={{ groupId: String(hub.groupId), adminId: String(runningAdmin.groupAdminId) }}
      />,
    );
  }
  for (const past of pastAdmins) {
    adminRows.push(
      <KkFactRow
        key={past.groupAdminId}
        title={formatPeriod(past.sinceOn, past.untilOn)}
        span=""
        meta={past.function ?? undefined}
      />,
    );
  }

  const unreachableNote = canOpenProfile ? null : <KkNote>{PERSON_SCREEN_UNREACHABLE_NOTE}</KkNote>;
  const header = (
    <HubPersonHeader
      groupName={hub.name}
      name={name}
      initials={initials}
      portrait={portrait}
      personId={personId}
      canOpenProfile={canOpenProfile}
    />
  );

  return (
    <KkScreen
      kind="detail"
      title={name}
      origin={toHubEditorOrigin(hub)}
      header={header}
      handover={AREA_HANDOVERS.groups}
    >
      <Stack sx={{ gap: 2, minWidth: 0 }}>
        <KkNote>{PERSON_SCREEN_CONTACT_NOTE}</KkNote>
        {unreachableNote}
        <KkPanelSection title={MEMBERSHIP_SECTION_TITLE}>
          <KkPanel variant="list">{membershipRows}</KkPanel>
        </KkPanelSection>
        <KkPanelSection title={ADMIN_SECTION_TITLE}>
          <KkPanel variant="list">{adminRows}</KkPanel>
        </KkPanelSection>
      </Stack>
    </KkScreen>
  );
};
