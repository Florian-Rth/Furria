import { KkPanelStack } from '@furria/ui/KkPanelStack';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import type { MemberDetails } from '../schemas';
import { MemberBoardPanel } from './MemberBoardPanel';
import { MemberClubPanel } from './MemberClubPanel';
import { MemberContactPanel } from './MemberContactPanel';
import { MemberGroupsPanel } from './MemberGroupsPanel';

interface MemberViewProps {
  member: MemberDetails;
  isSelf: boolean;
}

export const MemberView: FC<MemberViewProps> = ({ member, isSelf }) => (
  <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
    <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
      <KkPanelStack>
        <MemberGroupsPanel groups={member.groups} firstName={member.firstName} />
        <MemberBoardPanel terms={member.boardTerms} />
      </KkPanelStack>
    </Grid>
    <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
      <KkPanelStack>
        <MemberContactPanel contact={member.contact} firstName={member.firstName} isSelf={isSelf} />
        <MemberClubPanel member={member} />
      </KkPanelStack>
    </Grid>
  </Grid>
);
