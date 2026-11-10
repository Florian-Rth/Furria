import { createFileRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { NotFoundPage } from '@/components/NotFoundPage';
import { SiteChrome } from '@/components/SiteChrome';

const SiteLayout: FC = () => (
  <SiteChrome>
    <Outlet />
  </SiteChrome>
);

export const Route = createFileRoute('/_site')({
  component: SiteLayout,
  notFoundComponent: NotFoundPage,
});
