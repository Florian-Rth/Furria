import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Event, EventFacts } from '@/lib/seed/events';
import { buildEvent } from '@/lib/seed/events';
import { renderWithRouter } from '@/test/render';
import { EventListPage } from './EventListPage';

const SNAPSHOT_AT = new Date('2026-12-01T12:00');
const NOW = new Date('2026-12-15T12:00');

const baseFacts: EventFacts = {
  id: 'prunksitzung-1-2027',
  title: '1. Prunksitzung',
  type: 'Prunksitzung',
  venue: 'Dorfgemeindehaus Großfurra',
  startsAt: '2027-01-23T19:11',
  doorsOpenAt: '2027-01-23T18:11',
  teaser: 'Ein voller Abend.',
  description: null,
  performers: null,
  ageHint: 'ab 12 Jahren empfohlen',
  priceCents: 1400,
  capacity: 260,
  presaleStartsAt: '2026-11-11T11:11',
  presaleEndsAt: null,
  freeCount: 74,
};

const seasonEvents = (): Event[] => [
  buildEvent(baseFacts, SNAPSHOT_AT),
  buildEvent(
    {
      ...baseFacts,
      id: 'weiberfasching-2027',
      title: 'Weiberfasching',
      startsAt: '2027-02-04T19:11',
      priceCents: 1000,
      freeCount: 155,
    },
    SNAPSHOT_AT,
  ),
];

describe('EventListPage', () => {
  it('renders hero identity, hero card, list, venue, FAQ and Börse teaser', () => {
    renderWithRouter(<EventListPage events={seasonEvents()} now={NOW} />);

    expect(screen.getByRole('heading', { level: 1, name: 'VERANSTALTUNGEN' })).toBeInTheDocument();
    expect(screen.getByText('TERMINE & KARTEN · SESSION 2026/27')).toBeInTheDocument();
    expect(screen.getByText('NÄCHSTER ABEND MIT KARTEN')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'ALLE TERMINE' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'DORFGEMEINDEHAUS GROSSFURRA' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'ALLES, WAS DU WISSEN MUSST' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'AUSVERKAUFT IST NICHT DAS ENDE' }),
    ).toBeInTheDocument();
  });

  it('derives the hero stats honestly from the seed', () => {
    renderWithRouter(<EventListPage events={seasonEvents()} now={NOW} />);

    expect(screen.getByText('Abende')).toBeInTheDocument();
    expect(screen.getByText('ab 10 €')).toBeInTheDocument();
    expect(screen.getByText('229')).toBeInTheDocument();
  });

  it('keeps the identity but shows the farewell without stats and card after the season', () => {
    renderWithRouter(<EventListPage events={[]} now={NOW} />);

    expect(screen.getByRole('heading', { level: 1, name: 'VERANSTALTUNGEN' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'DIE SESSION IST GEFEIERT' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('NÄCHSTER ABEND MIT KARTEN')).not.toBeInTheDocument();
    expect(screen.queryByText('Karten noch frei')).not.toBeInTheDocument();
  });

  it('offers no purchase or Börse navigation anywhere', () => {
    renderWithRouter(<EventListPage events={seasonEvents()} now={NOW} />);

    const linkTargets = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    for (const target of linkTargets) {
      expect(target).toMatch(/^\/events\/[a-z0-9-]+$/);
    }
  });
});
