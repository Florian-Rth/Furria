import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { routeTree } from '@/routeTree.gen';

// Boots the real route tree with the real root providers — the closest thing
// to starting the app: teaser vs. dev-home branching and dialog wiring.
const renderHomeRoute = (): void => {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  render(<RouterProvider router={router} />);
};

afterEach(() => {
  window.sessionStorage.clear();
});

describe('home route', () => {
  it('shows the teaser and opens the unlock dialog from the CTA', async () => {
    const user = userEvent.setup();
    renderHomeRoute();

    await user.click(await screen.findByRole('button', { name: 'Einlass' }));

    expect(await screen.findByText('Einlass für Tester')).toBeInTheDocument();
  });

  it('shows the internal test area when access is already granted', async () => {
    writeGrantedToSession(window.sessionStorage);
    renderHomeRoute();

    expect(
      await screen.findByRole('heading', { name: 'Interner Testbereich' }),
    ).toBeInTheDocument();
  });
});
