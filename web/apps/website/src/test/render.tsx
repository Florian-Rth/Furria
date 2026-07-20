import { KkThemeProvider } from '@furria/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { PreviewAccessProvider } from '@/features/preview-access';
import { routeTree } from '@/routeTree.gen';

// The one test renderer: the same provider stack the app mounts, minus routing —
// keep in sync with routes/__root.tsx. A fresh QueryClient per render keeps
// caches from leaking between tests; mutation retries are off so error paths
// assert immediately.
export const renderWithProviders = (ui: ReactElement): RenderResult => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

  return render(
    <KkThemeProvider>
      <QueryClientProvider client={queryClient}>
        <PreviewAccessProvider>{ui}</PreviewAccessProvider>
      </QueryClientProvider>
    </KkThemeProvider>,
  );
};

// Boots the real route tree (with the real root providers) at a path — the
// closest thing to starting the app. For components that render router links
// and for route-level tests.
export const renderAtRoute = (path: string): RenderResult => {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  return render(<RouterProvider router={router} />);
};
