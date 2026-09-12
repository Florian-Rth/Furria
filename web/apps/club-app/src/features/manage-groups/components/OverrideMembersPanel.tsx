import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { MANAGE_GROUPS_SECTION_TITLES } from '../manage-groups-labels';
import type { ManagedMember } from '../schemas';
import { OverrideMemberRow } from './OverrideMemberRow';

const ADD_LABEL = 'Mitglied';
const EMPTY_TITLE = 'NOCH NIEMAND DABEI';
const EMPTY_DESCRIPTION =
  'In dieser Gruppe ist gerade niemand eingetragen. Du kannst jede Person aus dem Register aufnehmen.';

interface OverrideMembersPanelProps {
  members: readonly ManagedMember[];
  canManage: boolean;
  onAdd: () => void;
  onEnd: (groupMembershipId: number) => void;
}

export const OverrideMembersPanel: FC<OverrideMembersPanelProps> = ({
  members,
  canManage,
  onAdd,
  onEnd,
}) => {
  const rows = members.map((member) => (
    <OverrideMemberRow
      key={member.groupMembershipId}
      member={member}
      canManage={canManage}
      onEnd={onEnd}
    />
  ));

  const isEmpty = rows.length === 0;
  const variant = isEmpty ? 'block' : 'list';

  const action = canManage ? (
    <KkButton size="small" startIcon={<KkIcon name="add" size="small" />} onClick={onAdd}>
      {ADD_LABEL}
    </KkButton>
  ) : null;

  const body = isEmpty ? (
    <KkEmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
  ) : (
    rows
  );

  return (
    <KkPanelSection title={MANAGE_GROUPS_SECTION_TITLES.members} action={action}>
      <KkPanel variant={variant}>{body}</KkPanel>
    </KkPanelSection>
  );
};
