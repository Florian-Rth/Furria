import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { ADD_MEMBER_LABEL, MANAGE_GROUPS_SECTION_TITLES } from '../manage-groups-labels';
import type { ManagedMember } from '../schemas';
import { OverrideMemberRow } from './OverrideMemberRow';

const ADD_TEXT = 'Mitglied';
const EMPTY_TITLE = 'NOCH NIEMAND DABEI';
const EMPTY_DESCRIPTION =
  'In dieser Gruppe ist gerade niemand eingetragen. Du kannst jede Person aus dem Register aufnehmen.';

interface OverrideMembersPanelProps {
  members: readonly ManagedMember[];
  canManage: boolean;
  canOpenPerson: boolean;
  onAdd: () => void;
  onEnd: (groupMembershipId: number) => void;
}

export const OverrideMembersPanel: FC<OverrideMembersPanelProps> = ({
  members,
  canManage,
  canOpenPerson,
  onAdd,
  onEnd,
}) => {
  const rows = members.map((member) => (
    <OverrideMemberRow
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
      variant="outlined"
      startIcon={<KkIcon name="add" size="small" />}
      ariaLabel={ADD_MEMBER_LABEL}
      onClick={onAdd}
    >
      {ADD_TEXT}
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
