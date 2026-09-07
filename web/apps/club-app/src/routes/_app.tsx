import { createFileRoute, Outlet, redirect, useLocation } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppShell, SessionGate } from '@/features/session';
import { getSessionSnapshot } from '@/lib/api/session/session-store';
import { buildLoginSearch } from '@/lib/login-redirect';

const AppLayout: FC = () => {
  const location = useLocation();

  return (
    <SessionGate returnTo={location.href}>
      <AppShell>
        <Outlet />
      </AppShell>
    </SessionGate>
  );
};

export const Route = createFileRoute('/_app')({
  beforeLoad: ({ location }) => {
    const { status, expired } = getSessionSnapshot();

    if (status === 'anonymous') {
      throw redirect({
        to: '/login',
        search: buildLoginSearch(location.href, expired),
        replace: true,
      });
    }
  },
  component: AppLayout,
});
