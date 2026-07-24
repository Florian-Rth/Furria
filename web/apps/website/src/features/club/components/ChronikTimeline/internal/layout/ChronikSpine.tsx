import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const ChronikSpine: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-chronik-spine
    sx={{
      position: 'relative',
      gap: { xs: 3, md: 4 },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: (theme) => theme.spacing(1.5),
        bottom: (theme) => theme.spacing(1.5),
        left: '7px',
        width: '2px',
        bgcolor: 'divider',
      },
    }}
  >
    {children}
  </Stack>
);
