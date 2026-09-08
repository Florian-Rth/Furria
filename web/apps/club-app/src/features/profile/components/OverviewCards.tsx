import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import type { Me } from '@/lib/api/schemas';
import { OVERVIEW_CARD_SPACING, OVERVIEW_CARD_SPAN } from '../overview-grid';
import { OverviewAccessCard } from './OverviewAccessCard';
import { OverviewMembershipCard } from './OverviewMembershipCard';
import { OverviewPersonCard } from './OverviewPersonCard';

interface OverviewCardsProps {
  me: Me;
}

export const OverviewCards: FC<OverviewCardsProps> = ({ me }) => (
  <Grid container spacing={OVERVIEW_CARD_SPACING}>
    <Grid size={OVERVIEW_CARD_SPAN}>
      <OverviewAccessCard email={me.email} />
    </Grid>
    <Grid size={OVERVIEW_CARD_SPAN}>
      <OverviewPersonCard person={me.person} />
    </Grid>
    <Grid size={OVERVIEW_CARD_SPAN}>
      <OverviewMembershipCard membership={me.membership} />
    </Grid>
  </Grid>
);
