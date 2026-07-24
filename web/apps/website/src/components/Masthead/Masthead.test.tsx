import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { renderAtRoute } from '@/test/render';
import { DESKTOP_VIEWPORT_WIDTH, MOBILE_VIEWPORT_WIDTH, setViewportWidth } from '@/test/viewport';
import { navItems } from './nav-items';

beforeEach(() => {
  writeGrantedToSession(window.sessionStorage);
});

afterEach(() => {
  setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
  window.localStorage.clear();
  window.sessionStorage.clear();
  document.documentElement.removeAttribute('data-light');
  document.documentElement.removeAttribute('data-dark');
  window.scrollTo(0, 0);
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

  it('opens the chip nav from the menu button and navigates from it (mobile)', async () => {
    setViewportWidth(MOBILE_VIEWPORT_WIDTH);
    const user = userEvent.setup();
    renderAtRoute('/program');
    await screen.findByRole('heading', { level: 1, name: 'Programm' });

    const menuButton = screen.getByRole('button', { name: 'Menü öffnen' });
    await user.click(menuButton);
    expect(menuButton).toHaveAccessibleName('Menü schließen');
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    const chipNav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
    await user.click(within(chipNav).getByRole('link', { name: 'Verein' }));

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'DIE FÜNFTE JAHRESZEIT HAT EIN ZUHAUSE.',
      }),
    ).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('leads with the emphasized Tickets chip in the chip nav (mobile)', async () => {
    setViewportWidth(MOBILE_VIEWPORT_WIDTH);
    const user = userEvent.setup();
    renderAtRoute('/program');
    await screen.findByRole('heading', { level: 1, name: 'Programm' });

    await user.click(screen.getByRole('button', { name: 'Menü öffnen' }));

    const chipNav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
    const links = within(chipNav).getAllByRole('link');
    expect(links[0]).toHaveAccessibleName('Tickets');
    expect(links[0]).toHaveAttribute('href', '/tickets');
  });

  it('starts transparent at the top of the page and turns glass once scrolled', async () => {
    renderAtRoute('/program');
    await screen.findByRole('heading', { level: 1, name: 'Programm' });

    const header = document.querySelector('header');
    expect(header).toHaveAttribute('data-kk-masthead-scrolled', 'false');

    window.scrollTo(0, 200);
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(header).toHaveAttribute('data-kk-masthead-scrolled', 'true');
    });
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
