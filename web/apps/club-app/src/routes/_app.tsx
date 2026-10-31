import { createFileRoute, Navigate, Outlet, redirect, useLocation } from '@tanstack/react-router';
import type { FC } from 'react';
import { GalleryDevelopingPoller } from '@/features/gallery/components/GalleryDevelopingPoller';
import { buildLoginSearch } from '@/features/login/login-redirect';
import { AppFailure } from '@/features/session/components/AppFailure';
import { AppShell } from '@/features/session/components/AppShell';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { useSessionSnapshot } from '@/features/session/hooks/use-session-snapshot';
import { AppSearchSchema } from '@/features/session/schemas';
import { WelcomeGate } from '@/features/welcome/components/WelcomeGate';
import { getSessionSnapshot } from '@/lib/api/session/session-store';
import { LOGIN_PATH } from '@/lib/return-to';

const AppLayout: FC = () => {
  const location = useLocation();
  const { status, expired, farewell } = useSessionSnapshot();
  const loginSearch = buildLoginSearch(location.href, expired, farewell);

  if (status === 'anonymous') {
    return <Navigate to={LOGIN_PATH} search={loginSearch} replace />;
  }

  return (
    <AppShell>
      <GalleryDevelopingPoller />
      <WelcomeGate>
        <Outlet />
      </WelcomeGate>
    </AppShell>
  );
};

export const Route = createFileRoute('/_app')({
  validateSearch: AppSearchSchema,
  beforeLoad: ({ location }) => {
    const { status, expired, farewell } = getSessionSnapshot();

    if (status === 'anonymous') {
      throw redirect({
        to: LOGIN_PATH,
        search: buildLoginSearch(location.href, expired, farewell),
        replace: true,
      });
    }
  },
  component: AppLayout,
  errorComponent: AppFailure,
  notFoundComponent: ScreenNotFound,
});
