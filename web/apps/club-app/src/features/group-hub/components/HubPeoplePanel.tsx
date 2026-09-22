import type { KkPanelAction } from '@furria/ui';
import { KkEmptyState, KkPanel, KkPanelSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC, Ref } from 'react';
import {
  ADD_MEMBER_ACTION_LABEL,
  ADD_MEMBER_LABEL,
  NO_MEMBERS_TITLE,
  toNoMembersLine,
} from '@/features/group-detail';
import type { GroupTone } from '@/features/groups';
import { GROUP_SECTION_TITLES, toGroupPeopleNote } from '@/lib/group-sections';
import type { HubPerson } from '../hub-people';
import { countGroupAdmins } from '../hub-people';
import { HubPersonTile } from './HubPersonTile';

const GRID_SPACING = { xs: 1.75, desktop: 2.5 };
const TILE_SIZE = { xs: 3, desktop: 2 };

interface HubPeoplePanelProps {
  tone: GroupTone;
  people: readonly HubPerson[];
  groupName: string;
  canManage: boolean;
  viewerIsAffiliated: boolean;
  newPersonId: number | null;
  fireKey: number;
  titleRef: Ref<HTMLHeadingElement>;
  onAddMember: () => void;
}

export const HubPeoplePanel: FC<HubPeoplePanelProps> = ({
  tone,
  people,
  groupName,
  canManage,
  viewerIsAffiliated,
  newPersonId,
  fireKey,
  titleRef,
  onAddMember,
}) => {
  const isEmpty = people.length === 0;

  const action: KkPanelAction | undefined = canManage
    ? {
        label: ADD_MEMBER_LABEL,
        icon: 'add',
        ariaLabel: ADD_MEMBER_ACTION_LABEL,
        onClick: onAddMember,
      }
    : undefined;

  const body = isEmpty ? (
    <KkEmptyState
      size="panel"
      title={NO_MEMBERS_TITLE}
      description={toNoMembersLine(groupName, canManage)}
    />
  ) : (
    <Grid container spacing={GRID_SPACING} sx={{ minWidth: 0 }}>
      {people.map((person) => (
        <Grid key={person.personId} size={TILE_SIZE} sx={{ minWidth: 0 }}>
          <HubPersonTile
            tone={tone}
            person={person}
            canManage={canManage}
            viewerIsAffiliated={viewerIsAffiliated}
            isNew={person.personId === newPersonId}
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
      description={toGroupPeopleNote(people.length, countGroupAdmins(people))}
    >
      <KkPanel variant="block">{body}</KkPanel>
    </KkPanelSection>
  );
};
