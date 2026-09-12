import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC, Ref } from 'react';
import type { GroupDetailMember } from '@/features/group-detail';
import {
  ADD_MEMBER_ACTION_LABEL,
  ADD_MEMBER_LABEL,
  GroupMemberRow,
  NO_MEMBERS_TITLE,
  toNoMembersLine,
} from '@/features/group-detail';
import { MANAGE_GROUPS_SECTION_TITLES } from '../manage-groups-labels';

interface OverrideMembersPanelProps {
  members: readonly GroupDetailMember[];
  groupName: string;
  canManage: boolean;
  canOpenPerson: boolean;
  titleRef: Ref<HTMLHeadingElement>;
  onAdd: () => void;
  onEnd: (groupMembershipId: number) => void;
}

export const OverrideMembersPanel: FC<OverrideMembersPanelProps> = ({
  members,
  groupName,
  canManage,
  canOpenPerson,
  titleRef,
  onAdd,
  onEnd,
}) => {
  const rows = members.map((member) => {
    const end = (): void => {
      onEnd(member.groupMembershipId);
    };

    return (
      <GroupMemberRow
        key={member.groupMembershipId}
        member={member}
        canManage={canManage}
        canOpenPerson={canOpenPerson}
        onEnd={end}
      />
    );
  });

  const isEmpty = rows.length === 0;
  const variant = isEmpty ? 'block' : 'list';

  const action = canManage ? (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="add" size="small" />}
      ariaLabel={ADD_MEMBER_ACTION_LABEL}
      onClick={onAdd}
    >
      {ADD_MEMBER_LABEL}
    </KkButton>
  ) : null;

  const body = isEmpty ? (
    <KkEmptyState
      size="panel"
      title={NO_MEMBERS_TITLE}
      description={toNoMembersLine(groupName, canManage)}
    />
  ) : (
    rows
  );

  return (
    <KkPanelSection
      title={MANAGE_GROUPS_SECTION_TITLES.members}
      titleRef={titleRef}
      action={action}
    >
      <KkPanel variant={variant}>{body}</KkPanel>
    </KkPanelSection>
  );
};
