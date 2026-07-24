import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { SeasonStep as SeasonStepData } from '@/features/club/season-content';

interface SeasonStepProps {
  step: SeasonStepData;
  accented: boolean;
}

export const SeasonStep: FC<SeasonStepProps> = ({ step, accented }) => (
  <Card
    data-kk-season-step
    {...(accented && { 'data-kk-season-accented': true })}
    sx={{
      height: '100%',
      p: { xs: 2.5, md: 3 },
      ...(accented && {
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderColor: 'primary.main',
      }),
    }}
  >
    <Stack sx={{ gap: 1, alignItems: 'flex-start' }}>
      <Typography
        variant="h4"
        component="span"
        sx={{ color: accented ? 'inherit' : 'primary.main', lineHeight: 1 }}
      >
        {step.tag}
      </Typography>
      <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 800 }}>
        {step.title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: accented ? 'inherit' : 'text.secondary', opacity: accented ? 0.9 : 1 }}
      >
        {step.description}
      </Typography>
    </Stack>
  </Card>
);
