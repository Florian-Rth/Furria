import { KkEmptyState, KkPanel, KkSinceRow } from '@furria/ui';
import type { FC } from 'react';
import { formatSinceSession } from '@/lib/membership-labels';
import { MEMBER_SECTION_TITLES, toNoRolesDescription } from '../members-labels';
import type { MemberRole } from '../schemas';
import { MemberSection } from './MemberSection';

const SINCE_LABEL = 'seit';
const EMPTY_TITLE = 'KEINE ROLLE';

interface MemberRolesPanelProps {
  roles: readonly MemberRole[];
  firstName: string;
}

export const MemberRolesPanel: FC<MemberRolesPanelProps> = ({ roles, firstName }) => {
  const rows = roles.map((role) => (
    <KkSinceRow
      key={role.roleId}
      icon="role"
      tone="accent"
      title={role.name}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatSinceSession(role.since)}
    />
  ));

  const body =
    rows.length === 0 ? (
      <KkEmptyState title={EMPTY_TITLE} description={toNoRolesDescription(firstName)} />
    ) : (
      rows
    );

  return (
    <MemberSection title={MEMBER_SECTION_TITLES.roles}>
      <KkPanel>{body}</KkPanel>
    </MemberSection>
  );
};
