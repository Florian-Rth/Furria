import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

interface KkTouchLabBendProps {
  x: number;
  y: number;
  active: boolean;
}

export const KkTouchLabBend: FC<KkTouchLabBendProps> = ({ x, y, active }) => (
  <Box
    aria-hidden
    data-active={active}
    style={{ transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(45deg)` }}
    sx={(theme) => ({
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: 2,
      width: '0.875rem',
      height: '0.875rem',
      pointerEvents: 'none',
      borderRadius: `${kkTokens.radius.bar}px`,
      backgroundColor: touchLabPalette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${touchLabPalette(theme).primary.main}`,
      '&[data-active="true"]': {
        backgroundColor: touchLabPalette(theme).primary.main,
        scale: '1.4',
      },
    })}
  />
);
