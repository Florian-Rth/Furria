import { KkPanelStack } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { useFactEditor } from '../hooks/use-fact-editor';
import type { PersonDetails } from '../schemas';
import { EndMembershipDialog } from './EndMembershipDialog';
import { PersonFeeReductionsPanel } from './PersonFeeReductionsPanel';
import { PersonGroupsPanel } from './PersonGroupsPanel';
import { PersonMasterDataPanel } from './PersonMasterDataPanel';
import { PersonMembershipsPanel } from './PersonMembershipsPanel';
import { PersonRolesPanel } from './PersonRolesPanel';

interface PersonEditViewProps {
  person: PersonDetails;
}

export const PersonEditView: FC<PersonEditViewProps> = ({ person }) => {
  const editor = useFactEditor();
  const endedMembership =
    person.memberships.find((membership) => membership.membershipId === editor.endedMembershipId) ??
    null;

  return (
    <>
      <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
        <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
          <KkPanelStack>
            <PersonMembershipsPanel person={person} editor={editor} />
            <PersonFeeReductionsPanel person={person} editor={editor} />
          </KkPanelStack>
        </Grid>
        <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
          <KkPanelStack>
            <PersonMasterDataPanel person={person} />
            <PersonGroupsPanel groups={person.groups} firstName={person.firstName} />
            <PersonRolesPanel roles={person.roles} firstName={person.firstName} />
          </KkPanelStack>
        </Grid>
      </Grid>
      <EndMembershipDialog
        personId={person.personId}
        personName={`${person.firstName} ${person.lastName}`}
        firstName={person.firstName}
        membership={endedMembership}
        onClose={editor.close}
      />
    </>
  );
};
