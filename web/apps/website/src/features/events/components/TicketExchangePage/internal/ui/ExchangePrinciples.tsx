import { KkLead, KkSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { exchangePrinciplesContent } from '@/features/events/exchange-content';
import { ExchangeCardRow } from '../layout/ExchangeCardRow';
import { ExchangePrincipleCard } from './ExchangePrincipleCard';

export const ExchangePrinciples: FC = () => (
  <KkSection>
    <KkSection.Header
      kicker={exchangePrinciplesContent.kicker}
      title={exchangePrinciplesContent.title}
    />
    <KkLead>{exchangePrinciplesContent.intro}</KkLead>
    <ExchangeCardRow>
      {exchangePrinciplesContent.principles.map((principle) => (
        <Grid key={principle.title} size={{ xs: 12, md: 4 }}>
          <ExchangePrincipleCard principle={principle} />
        </Grid>
      ))}
    </ExchangeCardRow>
  </KkSection>
);
