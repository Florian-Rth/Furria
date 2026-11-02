import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

interface KkTouchLabPlayheadProps {
  x: number;
}

export const KkTouchLabPlayhead: FC<KkTouchLabPlayheadProps> = ({ x }) => (
  <Box
    aria-hidden
    style={{ transform: `translateX(${x}px)` }}
    sx={(theme) => ({
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 0,
      pointerEvents: 'none',
      borderLeft: `${kkTokens.line.section}px solid ${touchLabPalette(theme).primary.main}`,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-0.4375rem',
        borderLeft: '0.375rem solid transparent',
        borderRight: '0.375rem solid transparent',
        borderTop: `0.5rem solid ${touchLabPalette(theme).primary.main}`,
      },
    })}
  />
);
