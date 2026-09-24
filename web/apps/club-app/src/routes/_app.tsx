import { createFileRoute, Navigate, Outlet, redirect, useLocation } from '@tanstack/react-router';
import type { FC } from 'react';
import { buildLoginSearch } from '@/features/login';
import {
  AppFailure,
  AppSearchSchema,
  AppShell,
  ScreenNotFound,
  useSessionSnapshot,
} from '@/features/session';
import { getSessionSnapshot } from '@/lib/api/session/session-store';
import { LOGIN_PATH } from '@/lib/return-to';

const AppLayout: FC = () => {
  const location = useLocation();
  const { status, expired } = useSessionSnapshot();
  const loginSearch = buildLoginSearch(location.href, expired);

  if (status === 'anonymous') {
    return <Navigate to={LOGIN_PATH} search={loginSearch} replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

export const Route = createFileRoute('/_app')({
  validateSearch: AppSearchSchema,
  beforeLoad: ({ location }) => {
    const { status, expired } = getSessionSnapshot();

    if (status === 'anonymous') {
      throw redirect({
        to: LOGIN_PATH,
        search: buildLoginSearch(location.href, expired),
        replace: true,
      });
    }
  },
  component: AppLayout,
  errorComponent: AppFailure,
  notFoundComponent: ScreenNotFound,
});
