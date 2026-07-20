import { createFileRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { SiteChrome } from '@/components/SiteChrome';

// Pathless layout route: the branded chrome every real page renders inside.
// The home route ('/') stays outside on purpose — its ungated branch is the
// full-bleed teaser; its granted branch mounts SiteChrome itself.
const SiteLayout: FC = () => (
  <SiteChrome>
    <Outlet />
  </SiteChrome>
);

export const Route = createFileRoute('/_site')({ component: SiteLayout });
