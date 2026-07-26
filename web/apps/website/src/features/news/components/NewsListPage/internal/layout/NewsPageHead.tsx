import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const NewsPageHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-news-head
    direction={{ xs: 'column', md: 'row' }}
    sx={{
      alignItems: { md: 'flex-end' },
      justifyContent: 'space-between',
      gap: { xs: 3, md: 5 },
    }}
  >
    {children}
  </Stack>
);
