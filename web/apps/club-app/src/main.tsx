import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ScreenFailure } from '@/features/session';
import { startSession } from '@/lib/api/session/session-boot';
import { routeTree } from '@/routeTree.gen';

const router = createRouter({ routeTree, defaultErrorComponent: ScreenFailure });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Root element #root not found');
}

void startSession();

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
