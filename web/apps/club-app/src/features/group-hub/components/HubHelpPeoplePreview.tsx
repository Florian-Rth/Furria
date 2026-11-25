import { KkGroupTile } from '@furria/ui/KkGroupTile';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups/group-identity';
import { GROUP_ADMIN_ACCENT } from '../group-hub-labels';

const TILE_SIZE = 4;

const SAMPLE_PEOPLE = [
  { key: 'anna', initials: 'AB', name: 'Anna Becker', accent: GROUP_ADMIN_ACCENT },
  { key: 'jonas', initials: 'JK', name: 'Jonas Klein', accent: undefined },
  { key: 'marie', initials: 'MW', name: 'Marie Wolf', accent: undefined },
] as const;

interface HubHelpPeoplePreviewProps {
  tone: GroupTone;
}

export const HubHelpPeoplePreview: FC<HubHelpPeoplePreviewProps> = ({ tone }) => (
  <Grid container spacing={1.75} sx={{ minWidth: 0 }}>
    {SAMPLE_PEOPLE.map((person) => (
      <Grid key={person.key} size={TILE_SIZE} sx={{ minWidth: 0 }}>
        <KkGroupTile
          tone={tone}
          initials={person.initials}
          name={person.name}
          accent={person.accent}
        />
      </Grid>
    ))}
  </Grid>
);
