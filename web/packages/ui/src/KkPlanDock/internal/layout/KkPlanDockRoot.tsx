import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { planRaisedSurface } from '../../../internal/plan-surface';
import type { KkSx } from '../../../kk-sx';

interface KkPlanDockRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkPlanDockRoot: FC<KkPlanDockRootProps> = ({ label, sx, children }) => (
  <Stack
    role="toolbar"
    aria-label={label}
    direction="row"
    data-kk-plan-dock
    sx={[
      (theme) => ({
        ...planRaisedSurface(theme),
        alignItems: 'stretch',
        justifyContent: 'space-around',
        gap: 0.5,
        p: 0.5,
        overflowX: 'auto',
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
