import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { KkPanelAction } from '@furria/ui/panel-action';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  ADD_MEMBER_ACTION_LABEL,
  ADD_MEMBER_LABEL,
  NO_MEMBERS_TITLE,
  toNoMembersLine,
} from '@/features/group-detail/group-detail-labels';
import type { GroupTone } from '@/features/groups/group-identity';
import { GroupIntakes } from '@/features/manage-intakes/components/GroupIntakes';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { HUB_HELP_SPOTS } from '../group-hub-help-copy';
import type { HubPerson } from '../hub-people';
import { HubPersonTile } from './HubPersonTile';

const GRID_SPACING = { xs: 1.75, desktop: 2.5 };
const TILE_SIZE = { xs: 3, desktop: 2 };
const NEW_MEMBER_ROUTE = '/groups/$groupId/memberships/new';
const PANEL_STACK_SX = { gap: 1.5, minWidth: 0 } as const;

interface HubPeoplePanelProps {
  tone: GroupTone;
  people: readonly HubPerson[];
  groupId: number;
  groupName: string;
  canManage: boolean;
  canStartIntake: boolean;
  highlightedKey: string | null;
}

export const HubPeoplePanel: FC<HubPeoplePanelProps> = ({
  tone,
  people,
  groupId,
  groupName,
  canManage,
  canStartIntake,
  highlightedKey,
}) => {
  const isEmpty = people.length === 0;

  const action: KkPanelAction | undefined = canManage
    ? {
        label: ADD_MEMBER_LABEL,
        icon: 'add',
        ariaLabel: ADD_MEMBER_ACTION_LABEL,
        component: Link,
        to: NEW_MEMBER_ROUTE,
        params: { groupId: String(groupId) },
      }
    : undefined;

  const body = isEmpty ? (
    <KkEmptyState
      size="panel"
      icon="members"
      title={NO_MEMBERS_TITLE}
      description={toNoMembersLine(groupName)}
    />
  ) : (
    <Grid container spacing={GRID_SPACING} sx={{ minWidth: 0 }}>
      {people.map((person) => (
        <Grid key={person.personId} size={TILE_SIZE} sx={{ minWidth: 0 }}>
          <HubPersonTile
            tone={tone}
            person={person}
            groupId={groupId}
            canManage={canManage}
            highlightedKey={highlightedKey}
          />
        </Grid>
      ))}
    </Grid>
  );

  const intakes = canStartIntake ? <GroupIntakes groupId={groupId} /> : null;

  return (
    <KkPanelSection
      landing={HUB_HELP_SPOTS.people}
      title={GROUP_SECTION_TITLES.members}
      groupTone={tone}
      action={action}
    >
      <Stack sx={PANEL_STACK_SX}>
        <KkPanel variant="block">{body}</KkPanel>
        {intakes}
      </Stack>
    </KkPanelSection>
  );
};
