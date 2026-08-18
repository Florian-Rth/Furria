import { describe, expect, it } from 'vitest';
import type { EventFacts } from '@/lib/seed/events';
import { buildCancelledEvent, buildEvent } from '@/lib/seed/events';
import {
  deriveTicketPanelCta,
  deriveTicketPanelFace,
  deriveTicketPanelNote,
} from './ticket-panel-display';

const midPresale = new Date('2026-12-01T12:00');

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
  freeCount: 100,
};

const announced = buildEvent(
  { ...baseFacts, priceCents: null, capacity: null, presaleStartsAt: null, freeCount: null },
  midPresale,
);
const presaleScheduled = buildEvent(
  {
    ...baseFacts,
    capacity: null,
    presaleStartsAt: '2027-01-10T10:00',
    freeCount: null,
  },
  midPresale,
);
const onSale = buildEvent(baseFacts, midPresale);
const almostSoldOut = buildEvent({ ...baseFacts, freeCount: 12 }, midPresale);
const soldOut = buildEvent({ ...baseFacts, freeCount: 0 }, midPresale);
const salesClosed = buildEvent({ ...baseFacts, presaleEndsAt: '2026-11-30T23:59' }, midPresale);
const cancelled = buildCancelledEvent(baseFacts);

describe('deriveTicketPanelFace', () => {
  it('maps every sales status onto its own face', () => {
    expect(deriveTicketPanelFace(announced)).toEqual({ kind: 'announced' });
    expect(deriveTicketPanelFace(presaleScheduled)).toEqual({
      kind: 'presale',
      presaleStartsAt: '2027-01-10T10:00',
    });
    expect(deriveTicketPanelFace(onSale)).toEqual({ kind: 'onSale', scarce: false });
    expect(deriveTicketPanelFace(almostSoldOut)).toEqual({ kind: 'onSale', scarce: true });
    expect(deriveTicketPanelFace(soldOut)).toEqual({ kind: 'soldOut' });
    expect(deriveTicketPanelFace(salesClosed)).toEqual({ kind: 'closed' });
    expect(deriveTicketPanelFace(cancelled)).toEqual({ kind: 'cancelled' });
  });

  it('falls back to announced when a scheduled presale states no start', () => {
    const withoutStart = { ...presaleScheduled, presaleStartsAt: null };

    expect(deriveTicketPanelFace(withoutStart)).toEqual({ kind: 'announced' });
  });
});

describe('deriveTicketPanelCta', () => {
  it('leads into the Bestellflow of this event while Karten are sold', () => {
    expect(deriveTicketPanelCta(onSale)).toEqual({
      label: 'Karten wählen →',
      to: '/events/prunksitzung-1-2027/order',
      emphasis: 'contained',
    });
    expect(deriveTicketPanelCta(almostSoldOut)?.to).toBe('/events/prunksitzung-1-2027/order');
  });

  it('leads into the Kartenbörse once the evening is sold out', () => {
    expect(deriveTicketPanelCta(soldOut)).toEqual({
      label: 'Zur Kartenbörse →',
      to: '/events/exchange',
      emphasis: 'outlined',
    });
  });

  it('offers no action while nothing can be bought', () => {
    expect(deriveTicketPanelCta(announced)).toBeNull();
    expect(deriveTicketPanelCta(presaleScheduled)).toBeNull();
    expect(deriveTicketPanelCta(salesClosed)).toBeNull();
    expect(deriveTicketPanelCta(cancelled)).toBeNull();
  });
});

describe('deriveTicketPanelNote', () => {
  it('names the presale start with date and time', () => {
    const note = deriveTicketPanelNote(deriveTicketPanelFace(presaleScheduled));

    expect(note).toBe('Der Vorverkauf startet am 10.01.2027 um 10:00 Uhr.');
  });

  it('stays silent while Karten are on sale — the availability speaks instead', () => {
    expect(deriveTicketPanelNote(deriveTicketPanelFace(onSale))).toBeNull();
    expect(deriveTicketPanelNote(deriveTicketPanelFace(almostSoldOut))).toBeNull();
  });

  it('claims no Abendkasse and no return mechanics', () => {
    const closedNote = deriveTicketPanelNote(deriveTicketPanelFace(salesClosed)) ?? '';
    const soldOutNote = deriveTicketPanelNote(deriveTicketPanelFace(soldOut)) ?? '';

    expect(closedNote).not.toMatch(/Abendkasse/i);
    expect(soldOutNote).not.toMatch(/Warteliste|Rückgabe|zurückgeben/i);
  });

  it('explains every state that carries no action', () => {
    for (const event of [announced, presaleScheduled, soldOut, salesClosed, cancelled]) {
      expect(deriveTicketPanelNote(deriveTicketPanelFace(event))).not.toBeNull();
    }
  });
});
