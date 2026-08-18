import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseBerlinDateTime } from '@/lib/date';
import type { Event, EventFacts } from '@/lib/seed/events';
import { buildEvent } from '@/lib/seed/events';
import { renderWithRouter } from '@/test/render';
import { NextEventCard } from './NextEventCard';

const SNAPSHOT_AT = new Date('2026-12-01T12:00');
const NOW = parseBerlinDateTime('2026-12-15T12:00');

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

const seasonEvent = (overrides: Partial<EventFacts>): Event =>
  buildEvent({ ...baseFacts, ...overrides }, SNAPSHOT_AT);

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('NextEventCard', () => {
  it('counts down to the next evening with tickets', () => {
    renderWithRouter(<NextEventCard events={[seasonEvent({})]} now={NOW} />);

    expect(screen.getByText('NÄCHSTER ABEND MIT KARTEN')).toBeInTheDocument();
    expect(screen.getByText('Beginn in 39 Tagen 7 Std.')).toBeInTheDocument();
    expect(screen.getByText('74 von 260 frei')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Karten wählen →' })).toHaveAttribute(
      'href',
      '/events/prunksitzung-1-2027/order',
    );
    expect(screen.getByRole('link', { name: 'Zum Abend →' })).toHaveAttribute(
      'href',
      '/events/prunksitzung-1-2027',
    );
    expect(screen.queryByText('FAST WEG')).not.toBeInTheDocument();
  });

  it('tags an almost sold-out evening honestly', () => {
    renderWithRouter(<NextEventCard events={[seasonEvent({ freeCount: 18 })]} now={NOW} />);

    expect(screen.getByText('FAST WEG')).toBeInTheDocument();
    expect(screen.getByText('18 von 260 frei')).toBeInTheDocument();
  });

  it('counts down to a scheduled presale without a capacity bar', () => {
    const event = seasonEvent({ presaleStartsAt: '2027-01-10T10:00', freeCount: null });
    renderWithRouter(<NextEventCard events={[event]} now={NOW} />);

    expect(screen.getByText('VORVERKAUF STARTET')).toBeInTheDocument();
    expect(screen.getByText('in 25 Tagen 22 Std.')).toBeInTheDocument();
    expect(screen.getByText('Vorverkauf ab 10.01.2027')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('waits without a countdown while the presale is unannounced', () => {
    const event = seasonEvent({
      presaleStartsAt: null,
      priceCents: null,
      capacity: null,
      freeCount: null,
    });
    renderWithRouter(<NextEventCard events={[event]} now={NOW} />);

    expect(screen.getByText('NÄCHSTER ABEND')).toBeInTheDocument();
    expect(screen.getByText('Der Vorverkauf wird noch angekündigt.')).toBeInTheDocument();
    expect(screen.queryByText(/^in \d/)).not.toBeInTheDocument();
  });

  it('shows the honest status when only sold-out evenings remain', () => {
    renderWithRouter(<NextEventCard events={[seasonEvent({ freeCount: 0 })]} now={NOW} />);

    expect(screen.getByText('NÄCHSTER ABEND')).toBeInTheDocument();
    expect(screen.getByText('Ausverkauft')).toBeInTheDocument();
  });

  it('renders nothing after the last evening of the season', () => {
    renderWithRouter(
      <NextEventCard events={[seasonEvent({})]} now={new Date('2027-03-01T12:00')} />,
    );

    expect(screen.queryByText('Zum Abend →')).not.toBeInTheDocument();
    expect(screen.queryByText('NÄCHSTER ABEND')).not.toBeInTheDocument();
  });
});
