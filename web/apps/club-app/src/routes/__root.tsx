import '@furria/ui/fonts';
import { KkThemeColorMeta, KkThemeProvider } from '@furria/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { SessionBoot } from '@/features/session';
import { queryClient } from '@/lib/query-client';

const RootComponent: FC = () => (
  <KkThemeProvider>
    <KkThemeColorMeta />
    <QueryClientProvider client={queryClient}>
      <SessionBoot>
        <Outlet />
      </SessionBoot>
    </QueryClientProvider>
  </KkThemeProvider>
);

export const Route = createRootRoute({ component: RootComponent });
