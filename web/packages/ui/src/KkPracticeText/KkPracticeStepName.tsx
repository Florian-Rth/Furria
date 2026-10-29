import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import { KkPracticeFade } from './internal/ui/KkPracticeFade';

interface KkPracticeStepNameProps {
  stepKey: string;
  name: string;
  sx?: KkSx;
}

export const KkPracticeStepName: FC<KkPracticeStepNameProps> = ({ stepKey, name, sx }) => (
  <KkPracticeFade
    fadeKey={stepKey}
    sx={[{ height: { xs: '2.25rem', desktop: '2.75rem' } }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <Typography
      component="h2"
      aria-live="polite"
      data-kk-practice-step
      sx={{
        typography: { xs: 'h2', desktop: 'h1' },
        display: 'block',
        height: '100%',
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        lineHeight: { xs: '2.25rem', desktop: '2.75rem' },
      }}
    >
      {name}
    </Typography>
  </KkPracticeFade>
);
