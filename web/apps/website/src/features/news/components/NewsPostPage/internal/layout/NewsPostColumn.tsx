import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const NewsPostColumn: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-news-post sx={{ gap: { xs: 3.5, md: 5 } }}>
    {children}
  </Stack>
);
