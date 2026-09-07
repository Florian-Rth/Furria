import '@furria/ui/fonts';
import { KkThemeProvider } from '@furria/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { queryClient } from '@/lib/query-client';

const RootComponent: FC = () => (
  <KkThemeProvider>
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  </KkThemeProvider>
);

export const Route = createRootRoute({ component: RootComponent });
