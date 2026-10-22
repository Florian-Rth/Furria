import { createRootRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { InstallGate } from '@/features/app-install/components/InstallGate';
import { NativeChrome } from '@/features/native/components/NativeChrome';
import { AppFailure } from '@/features/session/components/AppFailure';
import { AppNotFound } from '@/features/session/components/AppNotFound';
import { SessionBoot } from '@/features/session/components/SessionBoot';

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
