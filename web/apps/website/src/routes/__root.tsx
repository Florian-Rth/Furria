import '@furria/ui/fonts';
import { kkTheme } from '@furria/ui';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { SiteFooter } from '@/components/SiteFooter';
import { PreviewAccessProvider } from '@/features/preview-access';
import { queryClient } from '@/lib/query-client';

const RootComponent: FC = () => (
  <ThemeProvider theme={kkTheme}>
    <CssBaseline enableColorScheme />
    <QueryClientProvider client={queryClient}>
      <PreviewAccessProvider>
        <Stack sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
          <Stack sx={{ flex: 1 }}>
            <Outlet />
          </Stack>
          <SiteFooter />
        </Stack>
      </PreviewAccessProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export const Route = createRootRoute({ component: RootComponent });
