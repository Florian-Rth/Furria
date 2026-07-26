import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const NewsTeaserHeader: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-news-teaser-header
    sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}
  >
    {children}
  </Stack>
);
