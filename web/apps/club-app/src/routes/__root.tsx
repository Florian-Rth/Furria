import { createRootRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { NativeChrome } from '@/features/native';
import { AppFailure, AppNotFound, SessionBoot } from '@/features/session';

const RootComponent: FC = () => (
  <>
    <NativeChrome />
    <SessionBoot>
      <Outlet />
    </SessionBoot>
  </>
);

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: AppFailure,
  notFoundComponent: AppNotFound,
});
