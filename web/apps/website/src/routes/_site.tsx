import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import type { FC } from 'react';
import { SiteChrome } from '@/components/SiteChrome';
import { usePreviewAccess } from '@/features/preview-access';

const SiteLayout: FC = () => {
  const { granted } = usePreviewAccess();
  const { pathname } = useLocation();
  const showsUngatedTeaser = !granted && pathname === '/';

  if (showsUngatedTeaser) {
    return <Outlet />;
  }

  return (
    <SiteChrome>
      <Outlet />
    </SiteChrome>
  );
};

export const Route = createFileRoute('/_site')({ component: SiteLayout });
