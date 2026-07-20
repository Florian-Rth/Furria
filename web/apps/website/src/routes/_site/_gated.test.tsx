import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { renderAtRoute } from '@/test/render';

afterEach(() => {
  window.sessionStorage.clear();
});

describe('preview gate', () => {
  it.each(['/program', '/tickets', '/apps'])(
    'redirects ungated visitors from %s to the teaser',
    async (path) => {
      renderAtRoute(path);

      // The teaser home, not the requested page: its CTA is there, the chrome is not.
      expect(await screen.findByRole('button', { name: 'Einlass' })).toBeInTheDocument();
      expect(screen.queryByRole('navigation', { name: 'Hauptnavigation' })).not.toBeInTheDocument();
    },
  );

  it('shows the tester portal at /apps inside the chrome once granted', async () => {
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/apps');

    expect(
      await screen.findByRole('heading', { name: 'Interner Testbereich' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Hauptnavigation' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
