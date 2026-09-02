import { KkCard } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { ExchangeIdeaItem } from '@/features/events/exchange-content';

interface ExchangeStepCardProps {
  numeral: string;
  step: ExchangeIdeaItem;
}

export const ExchangeStepCard: FC<ExchangeStepCardProps> = ({ numeral, step }) => (
  <KkCard>
    <KkCard.Body>
      <Typography
        variant="h3"
        component="span"
        data-kk-exchange-step-numeral
        sx={{ color: 'primary.main', lineHeight: 0.9 }}
      >
        {numeral}
      </Typography>
      <KkCard.Title>{step.title}</KkCard.Title>
      <KkCard.Text>{step.description}</KkCard.Text>
    </KkCard.Body>
  </KkCard>
);
