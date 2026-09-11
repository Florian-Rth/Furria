import { KkButton, KkEmptyState, KkIcon, KkPanel } from '@furria/ui';
import type { FC } from 'react';
import { HUB_SECTION_TITLES, toNoMembersLine } from '../group-hub-labels';
import type { HubMember } from '../schemas';
import { HubMemberRow } from './HubMemberRow';
import { HubSection } from './HubSection';

const NO_MEMBERS_TITLE = 'NOCH NIEMAND DABEI';
const ADD_LABEL = 'Mitglied';

interface HubMembersPanelProps {
  members: readonly HubMember[];
  groupName: string;
  canManage: boolean;
  onAdd: () => void;
  onEnd: (groupMembershipId: number) => void;
}

export const HubMembersPanel: FC<HubMembersPanelProps> = ({
  members,
  groupName,
  canManage,
  onAdd,
  onEnd,
}) => {
  const rows = members.map((member) => (
    <HubMemberRow
      key={member.groupMembershipId}
      member={member}
      canManage={canManage}
      onEnd={onEnd}
    />
  ));

  const isEmpty = rows.length === 0;
  const variant = isEmpty ? 'block' : 'list';

  const action = canManage ? (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="add" size="small" />}
      onClick={onAdd}
    >
      {ADD_LABEL}
    </KkButton>
  ) : null;

  const body = isEmpty ? (
    <KkEmptyState icon="person" title={NO_MEMBERS_TITLE} description={toNoMembersLine(groupName)} />
  ) : (
    rows
  );

  return (
    <HubSection title={HUB_SECTION_TITLES.members} action={action}>
      <KkPanel variant={variant}>{body}</KkPanel>
    </HubSection>
  );
};
