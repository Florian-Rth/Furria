import { createFileRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { SiteChrome } from '@/components/SiteChrome';

const SiteLayout: FC = () => (
  <SiteChrome>
    <Outlet />
  </SiteChrome>
);

export const Route = createFileRoute('/_site')({ component: SiteLayout });
