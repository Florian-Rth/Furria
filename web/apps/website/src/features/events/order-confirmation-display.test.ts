import { describe, expect, it } from 'vitest';
import { SEEDED_EVENTS } from '@/lib/seed/events';
import type { Order } from '@/lib/seed/orders';
import { buildOrder, DEMO_ORDER } from '@/lib/seed/orders';
import {
  buildOrderSummaryRows,
  deriveOrderTicketCountLabel,
  deriveOrderTicketLine,
  deriveOrderTotalLabel,
  derivePaymentStatusColor,
  isDemoOrder,
  selectOrderCrossSellEvent,
} from './order-confirmation-display';

const NOW = new Date('2026-12-01T12:00:00Z');

const singleTicketOrder = (): Order => {
  const event = SEEDED_EVENTS.find((candidate) => candidate.id === 'prunksitzung-1-2027');
  if (event === undefined) {
    throw new Error('the seed lost the demo evening');
  }
  return buildOrder({
    orderCode: 'single',
    event,
    ticketCount: 1,
    buyer: DEMO_ORDER.buyer,
    paymentStatus: 'processing',
  });
};

describe('deriveOrderTicketCountLabel', () => {
  it('counts several Karten', () => {
    expect(deriveOrderTicketCountLabel(DEMO_ORDER)).toBe('2 Karten');
  });

  it('counts a single Karte', () => {
    expect(deriveOrderTicketCountLabel(singleTicketOrder())).toBe('1 Karte');
  });
});

describe('deriveOrderTicketLine', () => {
  it('states the count next to the price of one Karte', () => {
    expect(deriveOrderTicketLine(DEMO_ORDER)).toBe('2 Karten · 14 € pro Karte');
  });
});

describe('deriveOrderTotalLabel', () => {
  it('sums the Bestellung', () => {
    expect(deriveOrderTotalLabel(DEMO_ORDER)).toBe('28 €');
  });
});

describe('isDemoOrder', () => {
  it('recognises the seeded example Bestellung', () => {
    expect(isDemoOrder(DEMO_ORDER)).toBe(true);
  });

  it('leaves every other Bestellung unmarked', () => {
    expect(isDemoOrder(singleTicketOrder())).toBe(false);
  });
});

describe('derivePaymentStatusColor', () => {
  it('separates a paid Bestellung from one still waiting', () => {
    expect(derivePaymentStatusColor('paid')).toBe('success');
    expect(derivePaymentStatusColor('processing')).toBe('info');
  });
});

describe('buildOrderSummaryRows', () => {
  it('shows the evening, the Karten, the sum and the buyer without any code', () => {
    expect(buildOrderSummaryRows(DEMO_ORDER)).toEqual([
      { label: 'Abend', value: '1. Prunksitzung' },
      { label: 'Termin', value: 'Sa., 23. Januar 2027 · 19:11 Uhr' },
      { label: 'Ort', value: 'Dorfgemeindehaus Großfurra' },
      { label: 'Karten', value: '2 Karten · 14 € pro Karte' },
      { label: 'Summe', value: '28 €' },
      { label: 'Bestellt von', value: 'Max Mustermann' },
      { label: 'E-Mail', value: 'max.mustermann@example.org' },
    ]);
  });

  it('never carries the order code into a visible row', () => {
    for (const row of buildOrderSummaryRows(DEMO_ORDER)) {
      expect(row.value).not.toContain(DEMO_ORDER.orderCode);
    }
  });
});

describe('selectOrderCrossSellEvent', () => {
  it('offers the next evening that still sells Karten', () => {
    const crossSell = selectOrderCrossSellEvent(SEEDED_EVENTS, DEMO_ORDER, NOW);

    expect(crossSell?.id).toBe('prunksitzung-2-2027');
  });

  it('never offers the evening the Bestellung is already for', () => {
    const ownEveningOnly = SEEDED_EVENTS.filter((event) => event.id === DEMO_ORDER.event.id);

    expect(selectOrderCrossSellEvent(ownEveningOnly, DEMO_ORDER, NOW)).toBeNull();
  });

  it('skips every evening that cannot be bought', () => {
    const blocked = SEEDED_EVENTS.filter(
      (event) => event.salesStatus !== 'onSale' && event.salesStatus !== 'almostSoldOut',
    );

    expect(blocked.length).toBeGreaterThan(0);
    expect(selectOrderCrossSellEvent(blocked, DEMO_ORDER, NOW)).toBeNull();
  });

  it('offers nothing once every evening has passed', () => {
    const afterTheSession = new Date('2027-06-01T12:00:00Z');

    expect(selectOrderCrossSellEvent(SEEDED_EVENTS, DEMO_ORDER, afterTheSession)).toBeNull();
  });
});
