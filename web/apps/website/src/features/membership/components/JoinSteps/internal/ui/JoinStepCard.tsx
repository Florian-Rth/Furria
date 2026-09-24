import { KkCard } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { JoinStep } from '@/features/membership/steps-content';

interface JoinStepCardProps {
  numeral: string;
  step: JoinStep;
}

export const JoinStepCard: FC<JoinStepCardProps> = ({ numeral, step }) => (
  <KkCard>
    <KkCard.Body>
      <Typography
        variant="h2"
        component="span"
        data-kk-join-step-numeral
        sx={{ color: 'primary.main', lineHeight: 0.9 }}
      >
        {numeral}
      </Typography>
      <KkCard.Title>{step.title}</KkCard.Title>
      <KkCard.Text>{step.description}</KkCard.Text>
    </KkCard.Body>
  </KkCard>
);
