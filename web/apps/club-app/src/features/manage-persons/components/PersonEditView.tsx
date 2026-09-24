import { KkPanelStack } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { useLanding } from '@/features/write';
import type { PersonDetails } from '../schemas';
import { PersonFeeReductionsPanel } from './PersonFeeReductionsPanel';
import { PersonGroupsPanel } from './PersonGroupsPanel';
import { PersonMasterDataPanel } from './PersonMasterDataPanel';
import { PersonMembershipsPanel } from './PersonMembershipsPanel';
import { PersonRolesPanel } from './PersonRolesPanel';

interface PersonEditViewProps {
  person: PersonDetails;
}

export const PersonEditView: FC<PersonEditViewProps> = ({ person }) => {
  const { highlightedKey } = useLanding();

  return (
    <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
        <KkPanelStack>
          <PersonMembershipsPanel person={person} highlightedKey={highlightedKey} />
          <PersonFeeReductionsPanel person={person} highlightedKey={highlightedKey} />
        </KkPanelStack>
      </Grid>
      <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
        <KkPanelStack>
          <PersonMasterDataPanel person={person} highlightedKey={highlightedKey} />
          <PersonGroupsPanel groups={person.groups} firstName={person.firstName} />
          <PersonRolesPanel roles={person.roles} firstName={person.firstName} />
        </KkPanelStack>
      </Grid>
    </Grid>
  );
};
