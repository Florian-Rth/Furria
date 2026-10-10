import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const NewsTies: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-news-ties sx={{ gap: 2 }}>
    {children}
  </Stack>
);
