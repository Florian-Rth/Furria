import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import type { FC } from 'react';
import { NotFoundPage } from '@/components/NotFoundPage';
import { SiteChrome } from '@/components/SiteChrome';
import { TesterChangelog } from '@/features/changelog';
import { usePreviewAccess } from '@/features/preview-access';

const SiteLayout: FC = () => {
  const { granted } = usePreviewAccess();
  const { pathname } = useLocation();
  const showsUngatedTeaser = !granted && pathname === '/';

  if (showsUngatedTeaser) {
    return <Outlet />;
  }

  return (
    <>
      <SiteChrome>
        <Outlet />
      </SiteChrome>
      {granted && <TesterChangelog />}
    </>
  );
};

export const Route = createFileRoute('/_site')({
  component: SiteLayout,
  notFoundComponent: NotFoundPage,
});
