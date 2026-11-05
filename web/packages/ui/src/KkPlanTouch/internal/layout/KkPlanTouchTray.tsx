import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkPlanTouchTray: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-plan-touch-tray
    sx={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 1.5,
      zIndex: 2,
      alignItems: 'center',
      px: 1,
      pointerEvents: 'none',
      '& > *': { pointerEvents: 'auto' },
    }}
  >
    {children}
  </Stack>
);
