import '@furria/api-client/zod-without-eval';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PageUnavailable } from '@/components/PageUnavailable';
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
    <RouterProvider router={router} />
  </StrictMode>,
);
