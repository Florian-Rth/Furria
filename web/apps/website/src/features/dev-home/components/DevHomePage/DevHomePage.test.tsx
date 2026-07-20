import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { renderAtRoute } from '@/test/render';

// The page renders router links, so it boots at its real (gated) route.
const renderPortal = (): void => {
  writeGrantedToSession(window.sessionStorage);
  renderAtRoute('/apps');
};

afterEach(() => {
  window.sessionStorage.clear();
});

describe('DevHomePage', () => {
  it('renders the internal test area with all three apps', async () => {
    renderPortal();

    expect(
      await screen.findByRole('heading', { name: 'Interner Testbereich' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Website' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Club-App' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Event-App' })).toBeInTheDocument();
  });

  it('launches the live website from its card', async () => {
    renderPortal();

    expect(await screen.findByRole('link', { name: /Website Live/ })).toHaveAttribute('href', '/');
  });

  it('keeps the planned apps as plain announcements', async () => {
    renderPortal();
    await screen.findByRole('heading', { name: 'Interner Testbereich' });

    expect(screen.getAllByText('Geplant')).toHaveLength(2);
    expect(screen.queryByRole('link', { name: /Club-App/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Event-App/ })).not.toBeInTheDocument();
  });
});
