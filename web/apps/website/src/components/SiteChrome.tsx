import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { Masthead } from '@/components/Masthead/Masthead';
import { SiteFooter } from '@/components/SiteFooter/SiteFooter';

// Layout only: the branded chrome (masthead + footer) around a page body.
// Rendered by the _site layout route — and by the granted home ('/'), which
// lives outside _site because its ungated branch is the full-bleed teaser.
// No co-located test on purpose: the masthead needs the router, so the route
// tests (_site.test.tsx, index.test.tsx) exercise the chrome in place.
export const SiteChrome: FC<PropsWithChildren> = ({ children }) => (
  <Stack sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
    <Masthead />
    <Stack sx={{ flex: 1 }}>{children}</Stack>
    <SiteFooter />
  </Stack>
);
