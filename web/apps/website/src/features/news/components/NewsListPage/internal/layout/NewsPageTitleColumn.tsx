import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const NewsPageTitleColumn: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-news-title sx={{ gap: { xs: 1.5, md: 2 }, alignItems: 'flex-start', minWidth: 0 }}>
    {children}
  </Stack>
);
