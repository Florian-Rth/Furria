import { KkNote, KkSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { exchangeCoreLoopContent } from '@/features/events/exchange-content';
import { ExchangeCardRow } from '../layout/ExchangeCardRow';
import { ExchangeStepCard } from './ExchangeStepCard';

export const ExchangeCoreLoop: FC = () => (
  <KkSection>
    <KkSection.Header
      kicker={exchangeCoreLoopContent.kicker}
      title={exchangeCoreLoopContent.title}
    />
    <ExchangeCardRow>
      {exchangeCoreLoopContent.steps.map((step, index) => (
        <Grid key={step.title} size={{ xs: 12, md: 4 }}>
          <ExchangeStepCard numeral={String(index + 1).padStart(2, '0')} step={step} />
        </Grid>
      ))}
    </ExchangeCardRow>
    <KkNote>{exchangeCoreLoopContent.note}</KkNote>
  </KkSection>
);
