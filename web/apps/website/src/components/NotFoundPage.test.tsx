import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { renderAtRoute } from '@/test/render';

afterEach(() => {
  window.sessionStorage.clear();
});

describe('not-found route', () => {
  it('shows the branded 404 inside the chrome for an unmatched path without a grant', async () => {
    renderAtRoute('/gibt-es-hier-nicht');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'HIER WAR MAL EINE SEITE.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Hauptnavigation' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Zur Startseite' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Zum Programm →' })).toHaveAttribute(
      'href',
      '/program',
    );
  });

  it('shows the same 404 once inside the chrome below a matched layout', async () => {
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/news/gibt-es-hier-nicht');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'HIER WAR MAL EINE SEITE.' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('navigation', { name: 'Hauptnavigation' })).toHaveLength(1);
  });
});
