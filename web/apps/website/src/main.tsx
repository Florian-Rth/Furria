import '@furria/api-client/zod-without-eval';
import '@furria/ui/fonts';
import { KkThemeProvider } from '@furria/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PageUnavailable } from '@/components/PageUnavailable';
import { queryClient } from '@/lib/query-client';
import { routeTree } from '@/routeTree.gen';

const router = createRouter({ routeTree, defaultErrorComponent: PageUnavailable });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <KkThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </KkThemeProvider>
  </StrictMode>,
);
