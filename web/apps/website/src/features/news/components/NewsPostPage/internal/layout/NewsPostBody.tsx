import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const NewsPostBody: FC<PropsWithChildren> = ({ children }) => (
  <Stack component="section" data-kk-news-post-body sx={{ gap: { xs: 2, md: 2.5 } }}>
    {children}
  </Stack>
);
