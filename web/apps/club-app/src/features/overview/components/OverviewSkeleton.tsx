import { KkCard } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { OVERVIEW_CARD_SPACING, OVERVIEW_CARD_SPAN } from '../overview-grid';
import { OverviewCard } from './OverviewCard';

const CARD_TITLES = ['Zugang', 'Person', 'Mitgliedschaft'];

export const OverviewSkeleton: FC = () => {
  const cards = CARD_TITLES.map((title) => (
    <Grid key={title} size={OVERVIEW_CARD_SPAN}>
      <OverviewCard title={title}>
        <KkCard.Text>Wird geladen …</KkCard.Text>
      </OverviewCard>
    </Grid>
  ));

  return (
    <Grid container spacing={OVERVIEW_CARD_SPACING} role="status" aria-busy>
      {cards}
    </Grid>
  );
};
