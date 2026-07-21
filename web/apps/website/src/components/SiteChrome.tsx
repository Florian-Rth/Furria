import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { Masthead } from '@/components/Masthead/Masthead';
import { SiteFooter } from '@/components/SiteFooter/SiteFooter';

export const SiteChrome: FC<PropsWithChildren> = ({ children }) => (
  <Stack sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
    <Masthead />
    <Stack sx={{ flex: 1 }}>{children}</Stack>
    <SiteFooter />
  </Stack>
);
