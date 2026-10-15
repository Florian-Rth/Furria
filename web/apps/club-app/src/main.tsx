import '@furria/api-client/zod-without-eval';
import '@furria/ui/fonts';
import { KkThemeColorMeta, KkThemeProvider } from '@furria/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ScreenFailure } from '@/features/session';
import { startSession } from '@/lib/api/session/session-boot';
import { markSessionUnavailable } from '@/lib/api/session/session-store';
import { withBackStack } from '@/lib/back-stack';
import { queryClient } from '@/lib/query-client';
import { routeTree } from '@/routeTree.gen';

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

createRoot(rootElement).render(
  <StrictMode>
    <KkThemeProvider>
      <KkThemeColorMeta />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </KkThemeProvider>
  </StrictMode>,
);
