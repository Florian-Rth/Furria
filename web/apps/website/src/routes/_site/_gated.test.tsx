import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { markChangelogSeen } from '@/test/changelog';
import { renderAtRoute } from '@/test/render';

beforeEach(() => {
  markChangelogSeen();
});

afterEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});

describe('preview gate', () => {
  it.each(['/events', '/events/exchange'])(
    'redirects ungated visitors from %s to the teaser',
    async (path) => {
      renderAtRoute(path);

      expect(await screen.findByRole('button', { name: 'Einlass' })).toBeInTheDocument();
      expect(screen.queryByRole('navigation', { name: 'Hauptnavigation' })).not.toBeInTheDocument();
    },
  );

  it('lets granted visitors through to the gated pages', async () => {
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/events');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'VERANSTALTUNGEN' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Hauptnavigation' })).toBeInTheDocument();
  });
});
