import { KkSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { exchangeIdeasContent } from '@/features/events/exchange-content';
import { ExchangeCardRow } from '../layout/ExchangeCardRow';
import { ExchangeIdeaCard } from './ExchangeIdeaCard';

export const ExchangeIdeas: FC = () => (
  <KkSection>
    <KkSection.Header kicker={exchangeIdeasContent.kicker} title={exchangeIdeasContent.title} />
    <ExchangeCardRow>
      {exchangeIdeasContent.ideas.map((idea) => (
        <Grid key={idea.title} size={{ xs: 12, md: 6 }}>
          <ExchangeIdeaCard idea={idea} />
        </Grid>
      ))}
    </ExchangeCardRow>
  </KkSection>
);
