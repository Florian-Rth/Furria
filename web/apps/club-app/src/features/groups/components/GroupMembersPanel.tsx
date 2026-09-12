import { KkEmptyState, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { GroupMemberRow, NO_MEMBERS_TITLE, toNoMembersLine } from '@/features/group-detail';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import type { GroupMember } from '../schemas';

interface GroupMembersPanelProps {
  members: readonly GroupMember[];
  groupName: string;
}

export const GroupMembersPanel: FC<GroupMembersPanelProps> = ({ members, groupName }) => {
  const rows = members.map((member) => (
    <GroupMemberRow key={member.personId} member={member} canManage={false} canOpenPerson />
  ));

  const isEmpty = rows.length === 0;
  const variant = isEmpty ? 'block' : 'list';

  const body = isEmpty ? (
    <KkEmptyState
      size="panel"
      title={NO_MEMBERS_TITLE}
      description={toNoMembersLine(groupName, false)}
    />
  ) : (
    rows
  );

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.members}>
      <KkPanel variant={variant}>{body}</KkPanel>
    </KkPanelSection>
  );
};
