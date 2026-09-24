import { KkCard } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { SeasonStep as SeasonStepData } from '@/features/club/season-content';

interface SeasonStepProps {
  step: SeasonStepData;
  accented: boolean;
}

export const SeasonStep: FC<SeasonStepProps> = ({ step, accented }) => (
  <KkCard
    sx={
      accented
        ? { bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'primary.main' }
        : undefined
    }
  >
    <KkCard.Body>
      <Typography
        variant="h2"
        component="span"
        sx={{ color: accented ? 'inherit' : 'primary.main', lineHeight: 1 }}
      >
        {step.tag}
      </Typography>
      <KkCard.Title>{step.title}</KkCard.Title>
      <KkCard.Text tone={accented ? 'onAccent' : 'muted'}>{step.description}</KkCard.Text>
    </KkCard.Body>
  </KkCard>
);
