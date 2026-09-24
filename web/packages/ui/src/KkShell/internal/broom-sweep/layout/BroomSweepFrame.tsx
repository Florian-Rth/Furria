import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, Ref } from 'react';
import { SWEEP_VAR, varOf } from '../logic/broom-sweep-vars';

const SETTLED_ROOT = '& > [data-kk-broom-sweep-settled] > *';

interface BroomSweepFrameProps extends PropsWithChildren {
  ref?: Ref<HTMLDivElement>;
}

export const BroomSweepFrame: FC<BroomSweepFrameProps> = ({ ref, children }) => (
  <Stack
    direction="row"
    ref={ref}
    data-kk-broom-sweep
    sx={{
      position: 'relative',
      minWidth: 0,
      [`${SETTLED_ROOT} > [data-kk-shell-bar-mark]`]: {
        opacity: varOf(SWEEP_VAR.markOpacity, '1'),
        transform: varOf(SWEEP_VAR.markTransform, 'none'),
      },
      [`${SETTLED_ROOT} > :not([data-kk-shell-bar-mark])`]: {
        clipPath: varOf(SWEEP_VAR.reveal, 'none'),
        opacity: varOf(SWEEP_VAR.revealOpacity, '1'),
      },
    }}
  >
    {children}
  </Stack>
);
