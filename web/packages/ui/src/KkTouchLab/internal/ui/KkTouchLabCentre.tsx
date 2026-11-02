import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

export const KkTouchLabCentre: FC = () => (
  <Box
    aria-hidden
    sx={(theme) => ({
      position: 'absolute',
      left: '50%',
      top: 0,
      bottom: 0,
      zIndex: 2,
      width: 0,
      pointerEvents: 'none',
      borderLeft: `${kkTokens.line.section}px solid ${touchLabPalette(theme).text.primary}`,
    })}
  />
);
