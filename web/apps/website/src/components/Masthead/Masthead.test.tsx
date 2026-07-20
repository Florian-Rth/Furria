import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { renderAtRoute } from '@/test/render';
import { DESKTOP_VIEWPORT_WIDTH, MOBILE_VIEWPORT_WIDTH, setViewportWidth } from '@/test/viewport';
import { navItems } from './nav-items';

// These tests render at gated routes, so grant preview access up front.
beforeEach(() => {
  writeGrantedToSession(window.sessionStorage);
});

afterEach(() => {
  setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
  window.localStorage.clear();
  window.sessionStorage.clear();
  document.documentElement.removeAttribute('data-light');
  document.documentElement.removeAttribute('data-dark');
});

describe('Masthead', () => {
  it('renders every nav item pointing at its route', async () => {
    renderAtRoute('/program');
    await screen.findByRole('heading', { level: 1, name: 'Programm' });

    for (const item of navItems) {
      expect(screen.getByRole('link', { name: item.label })).toHaveAttribute('href', item.to);
    }
  });

  it('links the Tickets pills to /tickets', async () => {
    renderAtRoute('/program');
    await screen.findByRole('heading', { level: 1, name: 'Programm' });

    const ticketLinks = screen.getAllByRole('link', { name: 'Tickets' });
    expect(ticketLinks.length).toBeGreaterThan(0);
    for (const link of ticketLinks) {
      expect(link).toHaveAttribute('href', '/tickets');
    }
  });

  it('opens the drawer from the hamburger and navigates from it (mobile)', async () => {
    setViewportWidth(MOBILE_VIEWPORT_WIDTH);
    const user = userEvent.setup();
    renderAtRoute('/program');
    await screen.findByRole('heading', { level: 1, name: 'Programm' });

    await user.click(screen.getByRole('button', { name: 'Menü öffnen' }));
    await screen.findByRole('button', { name: 'Menü schließen' });

    // On mobile the drawer renders the ONE shared nav data — the desktop bar
    // is display:none, so this is the drawer's nav.
    const drawerNav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
    await user.click(within(drawerNav).getByRole('link', { name: 'Verein' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Verein' })).toBeInTheDocument();
  });

  it('toggles to dark mode and persists the choice', async () => {
    const user = userEvent.setup();
    renderAtRoute('/program');
    await screen.findByRole('heading', { level: 1, name: 'Programm' });

    await user.click(screen.getByRole('button', { name: 'Zum dunklen Design wechseln' }));

    await waitFor(() => {
      expect(document.documentElement.hasAttribute('data-dark')).toBe(true);
    });
    expect(window.localStorage.getItem('mui-mode')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Zum hellen Design wechseln' })).toBeInTheDocument();
  });
});
