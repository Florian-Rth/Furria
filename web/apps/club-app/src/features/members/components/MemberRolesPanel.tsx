import { KkEmptyState, KkPanel, KkPanelSection, KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { formatSinceSession } from '@/lib/membership-labels';
import { MEMBER_SECTION_TITLES, toNoRolesDescription } from '../members-labels';
import type { MemberRole } from '../schemas';

const SINCE_LABEL = 'seit';
const EMPTY_TITLE = 'KEINE ROLLE';
const ROLES_PATH = '/manage/roles';

interface MemberRolesPanelProps {
  roles: readonly MemberRole[];
  firstName: string;
}

export const MemberRolesPanel: FC<MemberRolesPanelProps> = ({ roles, firstName }) => {
  const { has } = usePermissions();
  const mayOpenRole = has(PERMISSION_KEYS.rolesManage);

  const rows = roles.map((role) => {
    const linkProps = mayOpenRole
      ? { component: Link, to: ROLES_PATH, search: { role: role.roleId } }
      : {};

    return (
      <KkSinceRow
        key={role.roleId}
        icon="role"
        tone="accent"
        title={role.name}
        sinceLabel={SINCE_LABEL}
        sinceValue={formatSinceSession(role.since)}
        {...linkProps}
      />
    );
  });

  const body =
    rows.length === 0 ? (
      <KkEmptyState
        size="panel"
        title={EMPTY_TITLE}
        description={toNoRolesDescription(firstName)}
      />
    ) : (
      rows
    );

  return (
    <KkPanelSection title={MEMBER_SECTION_TITLES.roles}>
      <KkPanel>{body}</KkPanel>
    </KkPanelSection>
  );
};
