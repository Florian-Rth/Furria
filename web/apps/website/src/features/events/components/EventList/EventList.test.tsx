import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Event, EventFacts } from '@/lib/seed/events';
import { buildCancelledEvent, buildEvent } from '@/lib/seed/events';
import { renderWithRouter } from '@/test/render';
import { EventList } from './EventList';

const SNAPSHOT_AT = new Date('2026-12-01T12:00');
const FAR_FROM_EVERY_EVENT = new Date('2026-08-01T12:00');

const baseFacts: EventFacts = {
  id: 'prunksitzung-1-2027',
  title: '1. Prunksitzung',
  type: 'Prunksitzung',
  venue: 'Dorfgemeindehaus Großfurra',
  startsAt: '2027-01-23T19:11',
  doorsOpenAt: '2027-01-23T18:11',
  teaser: 'Ein voller Abend.',
  ageHint: 'ab 12 Jahren empfohlen',
  priceCents: 1400,
  capacity: 260,
  presaleStartsAt: '2026-11-11T11:11',
  presaleEndsAt: null,
  freeCount: 74,
};

const seasonEvent = (overrides: Partial<EventFacts>): Event =>
  buildEvent({ ...baseFacts, ...overrides }, SNAPSHOT_AT);

const eventsInEveryState = (): Event[] => [
  seasonEvent({
    id: 'announced-2027',
    title: 'Angekündigter Abend',
    startsAt: '2027-02-13T19:11',
    presaleStartsAt: null,
    priceCents: null,
    capacity: null,
    freeCount: null,
  }),
  seasonEvent({
    id: 'presale-scheduled-2027',
    title: 'Geplanter Vorverkauf',
    startsAt: '2027-02-12T19:11',
    presaleStartsAt: '2027-01-10T10:00',
    freeCount: null,
  }),
  seasonEvent({ id: 'on-sale-2027', title: 'Offener Abend', startsAt: '2027-01-23T19:11' }),
  seasonEvent({
    id: 'almost-sold-out-2027',
    title: 'Knapper Abend',
    startsAt: '2027-01-30T19:11',
    freeCount: 18,
  }),
  seasonEvent({
    id: 'sold-out-2027',
    title: 'Voller Abend',
    startsAt: '2027-02-04T19:11',
    freeCount: 0,
  }),
  seasonEvent({
    id: 'sales-closed-2027',
    title: 'Geschlossener Abend',
    startsAt: '2027-02-05T19:11',
    presaleEndsAt: '2026-11-30T18:00',
  }),
  buildCancelledEvent({
    ...baseFacts,
    id: 'cancelled-2027',
    title: 'Abgesagter Abend',
    startsAt: '2027-02-06T19:11',
    freeCount: null,
  }),
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('EventList', () => {
  it('renders every sales state with its honest label', () => {
    renderWithRouter(<EventList events={eventsInEveryState()} now={FAR_FROM_EVERY_EVENT} />);

    expect(screen.getByText('Vorverkauf folgt')).toBeInTheDocument();
    expect(screen.getByText('Vorverkauf ab 10.01.2027')).toBeInTheDocument();
    expect(screen.getByText('74 von 260 frei')).toBeInTheDocument();
    expect(screen.getByText('18 von 260 frei')).toBeInTheDocument();
    expect(screen.getByText('Ausverkauft')).toBeInTheDocument();
    expect(screen.getByText('Vorverkauf beendet')).toBeInTheDocument();
    expect(screen.getByText('Abgesagt')).toBeInTheDocument();
  });

  it('orders the rows by start date under the schedule heading with its range', () => {
    renderWithRouter(<EventList events={eventsInEveryState()} now={FAR_FROM_EVERY_EVENT} />);

    expect(screen.getByRole('heading', { level: 2, name: 'ALLE TERMINE' })).toBeInTheDocument();
    expect(screen.getByText('23. Januar – 13. Februar 2027')).toBeInTheDocument();

    const rowTitles = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
    expect(rowTitles).toEqual([
      'Offener Abend',
      'Knapper Abend',
      'Voller Abend',
      'Geschlossener Abend',
      'Abgesagter Abend',
      'Geplanter Vorverkauf',
      'Angekündigter Abend',
    ]);
  });

  it('links each row to its detail page and anchors it by event id', () => {
    renderWithRouter(<EventList events={eventsInEveryState()} now={FAR_FROM_EVERY_EVENT} />);

    const row = screen.getByRole('link', {
      name: 'Offener Abend · 23. Januar 2027 · 74 von 260 frei',
    });
    expect(row).toHaveAttribute('href', '/events/on-sale-2027');
    expect(row).toHaveAttribute('id', 'on-sale-2027');
  });

  it('badges evenings inside the next seven days', () => {
    const dayBeforeOnSaleEvening = new Date('2027-01-22T12:00');
    renderWithRouter(<EventList events={eventsInEveryState()} now={dayBeforeOnSaleEvening} />);

    const row = screen.getByRole('link', { name: /^Offener Abend/ });
    expect(within(row).getByText('Morgen')).toBeInTheDocument();
  });

  it('never claims urgency for a cancelled evening', () => {
    const dayBeforeCancelledEvening = new Date('2027-02-05T12:00');
    renderWithRouter(<EventList events={eventsInEveryState()} now={dayBeforeCancelledEvening} />);

    const cancelledRow = screen.getByRole('link', { name: /^Abgesagter Abend/ });
    expect(within(cancelledRow).queryByText('Morgen')).not.toBeInTheDocument();
  });

  it('scrolls to the row named in the location hash', () => {
    const scrollSpy = vi
      .spyOn(Element.prototype, 'scrollIntoView')
      .mockImplementation(() => undefined);

    renderWithRouter(
      <EventList events={eventsInEveryState()} now={FAR_FROM_EVERY_EVENT} />,
      '/#sold-out-2027',
    );

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  });

  it('celebrates the season instead of an empty list', () => {
    renderWithRouter(<EventList events={[]} now={FAR_FROM_EVERY_EVENT} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'DIE SESSION IST GEFEIERT' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Zur Galerie →' })).toHaveAttribute('href', '/gallery');
    expect(screen.getByRole('link', { name: 'Zu den Meldungen →' })).toHaveAttribute(
      'href',
      '/news',
    );
  });
});
