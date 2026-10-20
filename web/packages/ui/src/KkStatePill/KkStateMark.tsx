import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import { stateMark } from './state-paint';
import type { KkStepState } from './step-state';

const MARK_SIZE = 8;

interface KkStateMarkProps {
  state: KkStepState;
  sx?: KkSx;
}

export const KkStateMark: FC<KkStateMarkProps> = ({ state, sx }) => (
  <Box
    aria-hidden
    component="span"
    data-kk-state-mark={state}
    sx={[
      { display: 'inline-flex', flexShrink: 0, width: MARK_SIZE, height: MARK_SIZE },
      (theme) => stateMark(theme, state),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);
