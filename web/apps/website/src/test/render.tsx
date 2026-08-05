import { KkThemeProvider } from '@furria/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RouterHistory } from '@tanstack/react-router';
import {
  createMemoryHistory,
  createRouter,
  RouterContextProvider,
  RouterProvider,
} from '@tanstack/react-router';
import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { PreviewAccessProvider } from '@/features/preview-access';
import { routeTree } from '@/routeTree.gen';

const renderProviders = (ui: ReactElement): ReactElement => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

  return (
    <KkThemeProvider>
      <QueryClientProvider client={queryClient}>
        <PreviewAccessProvider>{ui}</PreviewAccessProvider>
      </QueryClientProvider>
    </KkThemeProvider>
  );
};

export const renderWithProviders = (ui: ReactElement): RenderResult => render(renderProviders(ui));

export const renderWithRouter = (ui: ReactElement): RenderResult => {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  return render(
    <RouterContextProvider router={router}>{renderProviders(ui)}</RouterContextProvider>,
  );
};

export interface RouteRenderResult extends RenderResult {
  history: RouterHistory;
}

export const renderAtRoute = (path: string): RouteRenderResult => {
  const history = createMemoryHistory({ initialEntries: [path] });
  const router = createRouter({ routeTree, history });

  return { ...render(<RouterProvider router={router} />), history };
};
