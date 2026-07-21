import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { renderAtRoute } from '@/test/render';

afterEach(() => {
  window.sessionStorage.clear();
});

describe('preview gate', () => {
  it.each(['/program', '/tickets'])(
    'redirects ungated visitors from %s to the teaser',
    async (path) => {
      renderAtRoute(path);

      expect(await screen.findByRole('button', { name: 'Einlass' })).toBeInTheDocument();
      expect(screen.queryByRole('navigation', { name: 'Hauptnavigation' })).not.toBeInTheDocument();
    },
  );

  it('lets granted visitors through to the gated pages', async () => {
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/program');

    expect(await screen.findByRole('heading', { level: 1, name: 'Programm' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Hauptnavigation' })).toBeInTheDocument();
  });
});
