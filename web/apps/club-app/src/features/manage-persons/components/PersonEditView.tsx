import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
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
          <Stack sx={{ gap: 3.5, minWidth: 0 }}>
            <PersonMembershipsPanel person={person} editor={editor} />
            <PersonFeeReductionsPanel person={person} editor={editor} />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
          <Stack sx={{ gap: 3.5, minWidth: 0 }}>
            <PersonMasterDataPanel person={person} />
            <PersonGroupsPanel groups={person.groups} firstName={person.firstName} />
            <PersonRolesPanel roles={person.roles} firstName={person.firstName} />
          </Stack>
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
