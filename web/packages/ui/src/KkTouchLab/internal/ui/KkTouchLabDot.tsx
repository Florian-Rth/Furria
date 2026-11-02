import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

export type KkTouchLabDotState = 'idle' | 'selected' | 'lifted';

interface KkTouchLabDotProps {
  x: number;
  y: number;
  number: number;
  state: KkTouchLabDotState;
  open: boolean;
}

export const KkTouchLabDot: FC<KkTouchLabDotProps> = ({ x, y, number, state, open }) => (
  <Box
    aria-hidden
    data-state={state}
    data-open={open}
    style={{ transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)` }}
    sx={(theme) => ({
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: state === 'idle' ? 1 : 3,
      width: '1.75rem',
      height: '1.75rem',
      display: 'grid',
      placeItems: 'center',
      pointerEvents: 'none',
      borderRadius: '50%',
      backgroundColor: touchLabPalette(theme).background.paper,
      color: touchLabPalette(theme).text.primary,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${touchLabPalette(theme).text.secondary}, ${kkTokens.shadow.rest}`,
      transition: 'box-shadow 120ms ease-out, scale 120ms ease-out',
      '&[data-open="true"]': {
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${touchLabPalette(theme).warning.main}`,
      },
      '&[data-state="selected"]': {
        backgroundColor: touchLabPalette(theme).primary.main,
        color: touchLabPalette(theme).primary.contrastText,
        boxShadow: `0 0 0 ${kkTokens.line.section}px ${touchLabPalette(theme).background.paper}, 0 0 0 ${kkTokens.line.page * 1.5}px ${touchLabPalette(theme).primary.main}`,
      },
      '&[data-state="lifted"]': {
        scale: '1.3',
        backgroundColor: touchLabPalette(theme).primary.main,
        color: touchLabPalette(theme).primary.contrastText,
        boxShadow: kkTokens.shadow.floating,
      },
    })}
  >
    <Typography
      component="span"
      variant="caption"
      sx={{ lineHeight: 1, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: 'inherit' }}
    >
      {number}
    </Typography>
  </Box>
);
