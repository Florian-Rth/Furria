import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const NewsShareRow: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    data-kk-news-share
    sx={{
      borderTop: 1,
      borderColor: 'divider',
      pt: { xs: 2.5, md: 3 },
      gap: { xs: 1.5, sm: 2 },
      alignItems: { sm: 'center' },
    }}
  >
    {children}
  </Stack>
);
