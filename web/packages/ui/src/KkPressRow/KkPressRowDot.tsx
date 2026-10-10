import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkPressTone } from './press-tone';
import { pressToneFill } from './press-tone';

interface KkPressRowDotProps {
  tone: KkPressTone;
}

export const KkPressRowDot: FC<KkPressRowDotProps> = ({ tone }) => (
  <Box
    aria-hidden
    sx={(theme: Theme) => ({
      width: theme.spacing(0.875),
      height: theme.spacing(0.875),
      borderRadius: '50%',
      flexShrink: 0,
      ...pressToneFill(theme, tone),
    })}
  />
);
