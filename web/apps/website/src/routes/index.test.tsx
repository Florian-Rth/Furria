import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { renderAtRoute } from '@/test/render';

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

describe('home route', () => {
  it('shows the teaser and opens the unlock dialog from the CTA', async () => {
    const user = userEvent.setup();
    renderAtRoute('/');

    await user.click(await screen.findByRole('button', { name: 'Einlass' }));

    expect(await screen.findByText('Einlass für Tester')).toBeInTheDocument();
  });

  it('lands on the tester portal at /apps after a successful unlock', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ granted: true }), { status: 200 })),
    );
    const user = userEvent.setup();
    renderAtRoute('/');

    await user.click(await screen.findByRole('button', { name: 'Einlass' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Passwort'), 'correct');
    await user.click(within(dialog).getByRole('button', { name: 'Einlass' }));

    expect(
      await screen.findByRole('heading', { name: 'Interner Testbereich' }),
    ).toBeInTheDocument();
  });

  it('keeps the legal pages reachable from the ungated teaser', async () => {
    renderAtRoute('/');
    const footer = await screen.findByRole('contentinfo');

    expect(within(footer).getByRole('link', { name: 'Impressum' })).toHaveAttribute(
      'href',
      '/imprint',
    );
    expect(within(footer).getByRole('link', { name: 'Datenschutz' })).toHaveAttribute(
      'href',
      '/privacy',
    );
  });

  it('applies the site-wide head defaults on the teaser', async () => {
    renderAtRoute('/');
    await screen.findByRole('button', { name: 'Einlass' });

    expect(document.title).toBe('FURRIA');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain(
      'Gross - Furria!',
    );
    expect(document.querySelector('meta[property="og:site_name"]')?.getAttribute('content')).toBe(
      'FURRIA',
    );
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
      'summary_large_image',
    );
  });

  it('shows the home placeholder inside the chrome when access is granted', async () => {
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Willkommen' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Hauptnavigation' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
