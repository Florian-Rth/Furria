import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeGrantedToSession } from '@/features/preview-access';
import { SEEDED_EVENTS } from '@/lib/seed/events';
import { markChangelogSeen } from '@/test/changelog';
import { renderAtRoute } from '@/test/render';

beforeEach(() => {
  markChangelogSeen();
});

afterEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});

const renderEvent = (slug: string): void => {
  writeGrantedToSession(window.sessionStorage);
  renderAtRoute(`/events/${slug}`);
};

describe('event detail route', () => {
  it.each(SEEDED_EVENTS.map((event) => [event.id, event.title]))(
    'renders %s as its own page',
    async (slug, title) => {
      renderEvent(slug);

      expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    },
  );

  it('answers an unknown slug with the branded 404, not an empty page', async () => {
    renderEvent('prunksitzung-1-1971');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'HIER WAR MAL EINE SEITE.' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '← Alle Veranstaltungen' })).not.toBeInTheDocument();
  });
});
