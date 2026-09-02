import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const TeaserList: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-teaser-list sx={{ display: { xs: 'flex', desktop: 'none' }, gap: 1.5 }}>
    {children}
  </Stack>
);
