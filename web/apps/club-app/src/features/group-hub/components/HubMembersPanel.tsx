import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { ADD_MEMBER_ACTION_LABEL, ADD_MEMBER_LABEL, toNoMembersLine } from '../group-hub-labels';
import type { HubMember } from '../schemas';
import { HubMemberRow } from './HubMemberRow';

const NO_MEMBERS_TITLE = 'NOCH NIEMAND DABEI';

interface HubMembersPanelProps {
  members: readonly HubMember[];
  groupName: string;
  canManage: boolean;
  canOpenPerson: boolean;
  onAdd: () => void;
  onEnd: (groupMembershipId: number) => void;
}

export const HubMembersPanel: FC<HubMembersPanelProps> = ({
  members,
  groupName,
  canManage,
  canOpenPerson,
  onAdd,
  onEnd,
}) => {
  const rows = members.map((member) => (
    <HubMemberRow
      key={member.groupMembershipId}
      member={member}
      canManage={canManage}
      canOpenPerson={canOpenPerson}
      onEnd={onEnd}
    />
  ));

  const isEmpty = rows.length === 0;
  const variant = isEmpty ? 'block' : 'list';

  const action = canManage ? (
    <KkButton
      size="small"
      startIcon={<KkIcon name="add" size="small" />}
      ariaLabel={ADD_MEMBER_ACTION_LABEL}
      onClick={onAdd}
    >
      {ADD_MEMBER_LABEL}
    </KkButton>
  ) : null;

  const body = isEmpty ? (
    <KkEmptyState title={NO_MEMBERS_TITLE} description={toNoMembersLine(groupName)} />
  ) : (
    rows
  );

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.members} action={action}>
      <KkPanel variant={variant}>{body}</KkPanel>
    </KkPanelSection>
  );
};
