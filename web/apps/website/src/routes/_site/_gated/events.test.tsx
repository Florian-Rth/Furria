import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
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

const JsonLdEventsSchema = z.array(z.object({ '@type': z.string(), name: z.string() }));

const readJsonLdEvents = (): z.infer<typeof JsonLdEventsSchema> => {
  const script = document.querySelector('script[type="application/ld+json"]');
  if (script?.textContent == null || script.textContent === '') {
    throw new Error('missing JSON-LD script on the events route');
  }
  return JsonLdEventsSchema.parse(JSON.parse(script.textContent));
};

describe('events route', () => {
  it('renders the Veranstaltungen page from the seeded events', async () => {
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/events');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'VERANSTALTUNGEN' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'ALLE TERMINE' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: '1. Prunksitzung' })).toBeInTheDocument();
  });

  it('emits schema.org Event JSON-LD for every seeded evening', async () => {
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/events');

    await screen.findByRole('heading', { level: 1, name: 'VERANSTALTUNGEN' });

    const jsonLdEvents = readJsonLdEvents();
    expect(jsonLdEvents).toHaveLength(SEEDED_EVENTS.length);
    expect(new Set(jsonLdEvents.map((entry) => entry['@type']))).toEqual(new Set(['Event']));
    expect(jsonLdEvents.map((entry) => entry.name)).toEqual(
      SEEDED_EVENTS.map((event) => event.title),
    );
  });
});
