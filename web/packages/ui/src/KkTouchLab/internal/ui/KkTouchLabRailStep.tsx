import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

export type KkTouchLabRailStepState = 'idle' | 'current' | 'looped';

interface KkTouchLabRailStepProps {
  left: number;
  width: number;
  name: string;
  detail: string;
  state: KkTouchLabRailStepState;
}

const STEP_GAP = 6;

export const KkTouchLabRailStep: FC<KkTouchLabRailStepProps> = ({
  left,
  width,
  name,
  detail,
  state,
}) => (
  <Stack
    data-state={state}
    style={{ left, width: width - STEP_GAP }}
    sx={(theme) => ({
      position: 'absolute',
      top: '0.5rem',
      bottom: '0.5rem',
      px: 1,
      justifyContent: 'center',
      clipPath: `inset(0 round ${kkTokens.radius.base}px)`,
      backgroundColor: touchLabPalette(theme).action.hover,
      color: touchLabPalette(theme).text.primary,
      transition: 'background-color 160ms ease-out, color 160ms ease-out',
      '&[data-state="current"]': {
        backgroundColor: touchLabPalette(theme).primary.main,
        color: touchLabPalette(theme).primary.contrastText,
      },
      '&[data-state="looped"]': {
        backgroundColor: touchLabPalette(theme).warning.main,
        color: touchLabPalette(theme).warning.contrastText,
      },
    })}
  >
    <Typography variant="body2" sx={{ fontWeight: 900, whiteSpace: 'nowrap', color: 'inherit' }}>
      {name}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        whiteSpace: 'nowrap',
        color: 'inherit',
        opacity: 0.8,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {detail}
    </Typography>
  </Stack>
);
