import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { renderAtRoute } from '@/test/render';

const placeholderRoutes = [
  ['/program', 'Programm'],
  ['/club', 'Verein'],
  ['/news', 'Aktuelles'],
  ['/gallery', 'Galerie'],
  ['/join', 'Mitglied werden'],
  ['/tickets', 'Tickets'],
] as const;

afterEach(() => {
  window.sessionStorage.clear();
});

describe('site shell', () => {
  it.each(placeholderRoutes)(
    '%s resolves to the branded placeholder "%s" once granted',
    async (path, title) => {
      writeGrantedToSession(window.sessionStorage);
      renderAtRoute(path);

      expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument();
      expect(screen.getByText('Diese Seite entsteht gerade.')).toBeInTheDocument();
      // Chrome around the page: masthead nav + footer.
      expect(screen.getByRole('navigation', { name: 'Hauptnavigation' })).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    },
  );

  it('/imprint renders the Impressum inside the chrome without the preview grant', async () => {
    renderAtRoute('/imprint');

    expect(await screen.findByRole('heading', { level: 1, name: 'Impressum' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('/privacy renders the Datenschutzerklärung inside the chrome without the preview grant', async () => {
    renderAtRoute('/privacy');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Datenschutzerklärung' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
