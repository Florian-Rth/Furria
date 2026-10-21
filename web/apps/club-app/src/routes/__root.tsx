import { createRootRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { InstallGate } from '@/features/app-install';
import { NativeChrome } from '@/features/native';
import { AppFailure, AppNotFound, SessionBoot } from '@/features/session';

const RootComponent: FC = () => (
  <>
    <NativeChrome />
    <InstallGate>
      <SessionBoot>
        <Outlet />
      </SessionBoot>
    </InstallGate>
  </>
);

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: AppFailure,
  notFoundComponent: AppNotFound,
});
