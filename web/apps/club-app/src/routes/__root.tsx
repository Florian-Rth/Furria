import '@furria/ui/fonts';
import { KkThemeColorMeta, KkThemeProvider } from '@furria/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { NativeChrome } from '@/features/native';
import { AppFailure, AppNotFound, SessionBoot } from '@/features/session';
import { queryClient } from '@/lib/query-client';

const RootComponent: FC = () => (
  <KkThemeProvider>
    <KkThemeColorMeta />
    <NativeChrome />
    <QueryClientProvider client={queryClient}>
      <SessionBoot>
        <Outlet />
      </SessionBoot>
    </QueryClientProvider>
  </KkThemeProvider>
);

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: AppFailure,
  notFoundComponent: AppNotFound,
});
