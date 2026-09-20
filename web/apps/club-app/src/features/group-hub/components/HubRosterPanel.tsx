import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC, Ref } from 'react';
import type { GroupDetailMember } from '@/features/group-detail';
import {
  ADD_MEMBER_ACTION_LABEL,
  ADD_MEMBER_LABEL,
  NO_MEMBERS_TITLE,
  toNoMembersLine,
} from '@/features/group-detail';
import type { GroupTone } from '@/features/groups';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { HubRosterTile } from './HubRosterTile';

const GRID_SPACING = { xs: 1.75, desktop: 2.5 };
const TILE_SIZE = { xs: 3, desktop: 2 };

interface HubRosterPanelProps {
  tone: GroupTone;
  members: readonly GroupDetailMember[];
  groupName: string;
  canManage: boolean;
  viewerIsAffiliated: boolean;
  newPersonId: number | null;
  fireKey: number;
  titleRef: Ref<HTMLHeadingElement>;
  onAdd: () => void;
}

export const HubRosterPanel: FC<HubRosterPanelProps> = ({
  tone,
  members,
  groupName,
  canManage,
  viewerIsAffiliated,
  newPersonId,
  fireKey,
  titleRef,
  onAdd,
}) => {
  const isEmpty = members.length === 0;

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
    <Grid container spacing={GRID_SPACING} sx={{ minWidth: 0 }}>
      {members.map((member) => (
        <Grid key={member.groupMembershipId} size={TILE_SIZE} sx={{ minWidth: 0 }}>
          <HubRosterTile
            tone={tone}
            member={member}
            canManage={canManage}
            viewerIsAffiliated={viewerIsAffiliated}
            isNew={member.personId === newPersonId}
            fireKey={fireKey}
          />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <KkPanelSection
      title={GROUP_SECTION_TITLES.members}
      groupTone={tone}
      titleRef={titleRef}
      action={action}
    >
      <KkPanel variant="block">{body}</KkPanel>
    </KkPanelSection>
  );
};
