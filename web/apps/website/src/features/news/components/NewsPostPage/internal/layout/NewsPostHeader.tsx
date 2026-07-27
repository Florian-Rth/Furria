import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const NewsPostHeader: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="header"
    data-kk-news-post-header
    sx={{ gap: { xs: 1.5, md: 2 }, alignItems: 'flex-start', minWidth: 0 }}
  >
    {children}
  </Stack>
);
