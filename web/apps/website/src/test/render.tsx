import { KkThemeProvider } from '@furria/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { PreviewAccessProvider } from '@/features/preview-access';
import { routeTree } from '@/routeTree.gen';

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

export const renderAtRoute = (path: string): RenderResult => {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  return render(<RouterProvider router={router} />);
};
