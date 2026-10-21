import '@furria/api-client/zod-without-eval';
import '@furria/ui/fonts';
import { KkAppFeel, KkThemeColorMeta, KkThemeProvider } from '@furria/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyBrowserModeParam } from '@/features/app-install';
import { startAppUpdates } from '@/features/app-install/app-update-start';
import { ScreenFailure } from '@/features/session';
import { startSession } from '@/lib/api/session/session-boot';
import { markSessionUnavailable } from '@/lib/api/session/session-store';
import { withBackStack } from '@/lib/back-stack';
import { queryClient } from '@/lib/query-client';
import { routeTree } from '@/routeTree.gen';

applyBrowserModeParam();

const router = createRouter({
  routeTree,
  history: withBackStack(createBrowserHistory()),
  defaultErrorComponent: ScreenFailure,
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
