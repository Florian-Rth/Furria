import '@furria/ui/fonts';
import { kkTheme } from '@furria/ui';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { queryClient } from '@/lib/query-client';

const RootComponent: FC = () => (
  <ThemeProvider theme={kkTheme}>
    <CssBaseline enableColorScheme />
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  </ThemeProvider>
);

export const Route = createRootRoute({ component: RootComponent });
