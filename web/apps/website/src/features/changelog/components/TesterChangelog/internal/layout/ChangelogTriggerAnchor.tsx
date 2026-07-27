import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const ChangelogTriggerAnchor: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-changelog-trigger
    sx={(theme) => ({
      position: 'fixed',
      right: { xs: theme.spacing(2), md: theme.spacing(3) },
      bottom: { xs: theme.spacing(12), sm: theme.spacing(8) },
      zIndex: theme.zIndex.fab,
    })}
  >
    {children}
  </Box>
);
