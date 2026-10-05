import { KkPanelStack } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import type { MembershipApplicationDetails } from '../schemas';
import { MembershipApplicantPanel } from './MembershipApplicantPanel';
import { MembershipApplicationDecline } from './MembershipApplicationDecline';
import { MembershipApplicationIntakePanel } from './MembershipApplicationIntakePanel';

const GRID_SPACING = { xs: 3.5, desktop: 5 };
const WIDE_SIZE = { xs: 12, desktop: 7 };
const NARROW_SIZE = { xs: 12, desktop: 5 };
const CELL_SX = { minWidth: 0 } as const;

interface MembershipApplicationViewProps {
  application: MembershipApplicationDetails;
}

export const MembershipApplicationView: FC<MembershipApplicationViewProps> = ({ application }) => (
  <KkPanelStack>
    <Grid container spacing={GRID_SPACING} sx={CELL_SX}>
      <Grid size={WIDE_SIZE} sx={CELL_SX}>
        <MembershipApplicantPanel application={application} />
      </Grid>
      <Grid size={NARROW_SIZE} sx={CELL_SX}>
        <MembershipApplicationIntakePanel application={application} />
      </Grid>
    </Grid>
    <MembershipApplicationDecline application={application} />
  </KkPanelStack>
);
