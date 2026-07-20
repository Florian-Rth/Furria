import Stack from '@mui/material/Stack';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { Masthead } from '@/components/Masthead/Masthead';
import { SiteFooter } from '@/components/SiteFooter/SiteFooter';

// Pathless layout route: the branded chrome (masthead + footer) every real
// page renders inside. The teaser home ('/') stays outside on purpose.
const SiteLayout: FC = () => (
  <Stack sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
    <Masthead />
    <Stack sx={{ flex: 1 }}>
      <Outlet />
    </Stack>
    <SiteFooter />
  </Stack>
);

export const Route = createFileRoute('/_site')({ component: SiteLayout });
