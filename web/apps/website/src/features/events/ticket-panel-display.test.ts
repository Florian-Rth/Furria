import { describe, expect, it } from 'vitest';
import type { Event } from '@/lib/public-events/schemas';
import type { TicketPanelFace } from './ticket-panel-display';
import { deriveTicketPanelFace } from './ticket-panel-display';

const eveningWith = (overrides: Partial<Event>): Event => ({
  eventId: 1,
  title: '1. Prunksitzung',
  startsAt: '2027-01-23T19:11',
  endsAt: null,
  doorsOpenAt: null,
  venue: { name: 'Dorfgemeindehaus', street: '', zip: '', city: '', hint: null },
  teaser: 'Ein voller Abend.',
  ageHint: null,
  priceCents: 1400,
  presaleStartsAt: '2026-11-11T11:11',
  status: 'available',
  ...overrides,
});

describe('deriveTicketPanelFace', () => {
  it.each<[Partial<Event>, TicketPanelFace]>([
    [{ status: 'presaleScheduled', presaleStartsAt: null }, { kind: 'announced' }],
    [
      { status: 'presaleScheduled', presaleStartsAt: '2027-01-10T10:00' },
      { kind: 'presale', presaleStartsAt: '2027-01-10T10:00' },
    ],
    [{ status: 'available' }, { kind: 'tickets', scarce: false }],
    [{ status: 'fewLeft' }, { kind: 'tickets', scarce: true }],
  ])('shows the face for %j', (overrides, face) => {
    expect(deriveTicketPanelFace(eveningWith(overrides))).toEqual(face);
  });
});
