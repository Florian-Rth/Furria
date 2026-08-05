import { KkLead, KkSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import {
  buildJoinStepNumeral,
  JOIN_STEPS,
  joinStepsIntro,
  joinStepsKicker,
  joinStepsTitle,
} from '@/features/membership/steps-content';
import { JoinStepRow } from './internal/layout/JoinStepRow';
import { JoinStepCard } from './internal/ui/JoinStepCard';

export const JoinSteps: FC = () => (
  <KkSection>
    <KkSection.Header kicker={joinStepsKicker} title={joinStepsTitle} />
    <KkLead>{joinStepsIntro}</KkLead>
    <JoinStepRow>
      {JOIN_STEPS.map((step, index) => (
        <Grid key={step.title} size={{ xs: 12, sm: 6, md: 'grow' }}>
          <JoinStepCard numeral={buildJoinStepNumeral(index)} step={step} />
        </Grid>
      ))}
    </JoinStepRow>
  </KkSection>
);
