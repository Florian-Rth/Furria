import { KkAvatar, KkMeta, KkPanel, KkPanelSection, KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { formatSinceSession } from '@/lib/membership-labels';
import { GROUP_SECTION_TITLES, toNoMembersLine } from '../groups-labels';
import type { GroupMember } from '../schemas';

const SINCE_LABEL = 'seit';
const MEMBER_PATH = '/members/$personId';

interface GroupMembersPanelProps {
  members: readonly GroupMember[];
  groupName: string;
}

export const GroupMembersPanel: FC<GroupMembersPanelProps> = ({ members, groupName }) => {
  const rows = members.map((member) => {
    const memberName = `${member.firstName} ${member.lastName}`;
    const avatar = (
      <KkAvatar
        initials={toInitials(member.firstName, member.lastName)}
        size="small"
        component="span"
      />
    );

    return (
      <KkSinceRow
        key={member.personId}
        avatar={avatar}
        title={memberName}
        sinceLabel={SINCE_LABEL}
        sinceValue={formatSinceSession(member.since)}
        component={Link}
        to={MEMBER_PATH}
        params={{ personId: String(member.personId) }}
      />
    );
  });

  const isEmpty = rows.length === 0;
  const body = isEmpty ? <KkMeta italic>{toNoMembersLine(groupName)}</KkMeta> : rows;
  const variant = isEmpty ? 'block' : 'list';

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.members}>
      <KkPanel variant={variant}>{body}</KkPanel>
    </KkPanelSection>
  );
};
