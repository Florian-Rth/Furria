import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

interface KkTouchLabLoupeProps extends PropsWithChildren {
  x: number;
  y: number;
  diameter: number;
  contentX: number;
  contentY: number;
  zoom: number;
  areaWidth: number;
  areaHeight: number;
}

export const KkTouchLabLoupe: FC<KkTouchLabLoupeProps> = ({
  x,
  y,
  diameter,
  contentX,
  contentY,
  zoom,
  areaWidth,
  areaHeight,
  children,
}) => (
  <Box
    aria-hidden
    style={{ left: x - diameter / 2, top: y - diameter / 2, width: diameter, height: diameter }}
    sx={(theme) => ({
      position: 'absolute',
      zIndex: 5,
      pointerEvents: 'none',
      borderRadius: '50%',
      clipPath: 'circle(50%)',
      backgroundColor: touchLabPalette(theme).background.paper,
      boxShadow: kkTokens.shadow.floating,
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        boxShadow: `inset 0 0 0 ${kkTokens.line.page}px ${touchLabPalette(theme).text.primary}`,
      },
    })}
  >
    <Box
      style={{
        width: areaWidth,
        height: areaHeight,
        transform: `translate(${contentX}px, ${contentY}px) scale(${zoom})`,
      }}
      sx={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0' }}
    >
      {children}
    </Box>
  </Box>
);
