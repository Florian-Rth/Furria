import '@furria/api-client/zod-without-eval';
import '@furria/ui/fonts';
import { KkAppFeel } from '@furria/ui/KkAppFeel';
import { KkThemeColorMeta } from '@furria/ui/KkThemeColorMeta';
import { KkThemeProvider } from '@furria/ui/KkThemeProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  createBrowserHistory,
  createRouter,
  lazyRouteComponent,
  RouterProvider,
} from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { startAppUpdates } from '@/features/app-install/app-update-start';
import { applyBrowserModeParam } from '@/features/app-install/browser-mode-store';
import { startSession } from '@/lib/api/session/session-boot';
import { markSessionUnavailable } from '@/lib/api/session/session-store';
import { withBackStack } from '@/lib/back-stack';
import { queryClient } from '@/lib/query-client';
import { routeTree } from '@/routeTree.gen';

applyBrowserModeParam();

const router = createRouter({
  routeTree,
  history: withBackStack(createBrowserHistory()),
  defaultErrorComponent: lazyRouteComponent(
    () => import('@/features/session/components/ScreenFailure'),
    'ScreenFailure',
  ),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Root element #root not found');
}

void startSession().catch(markSessionUnavailable);
startAppUpdates();

createRoot(rootElement).render(
  <StrictMode>
    <KkThemeProvider>
      <KkAppFeel />
      <KkThemeColorMeta />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </KkThemeProvider>
  </StrictMode>,
);
