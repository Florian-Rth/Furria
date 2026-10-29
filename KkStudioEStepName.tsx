import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import { KkStudioEFade } from './internal/ui/KkStudioEFade';

interface KkStudioEStepNameProps {
  stepKey: string;
  name: string;
  sx?: KkSx;
}

export const KkStudioEStepName: FC<KkStudioEStepNameProps> = ({ stepKey, name, sx }) => (
  <KkStudioEFade
    fadeKey={stepKey}
    sx={[
      { flex: 1, height: { xs: '2rem', desktop: '2.5rem' } },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Typography
      component="h2"
      variant="h2"
      aria-live="polite"
      data-kk-studio-e-step
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        [theme.breakpoints.up('desktop')]: theme.typography.h1,
        [`${theme.breakpoints.up('desktop')} &`]: { lineHeight: 1 },
      })}
    >
      {name}
    </Typography>
  </KkStudioEFade>
);
