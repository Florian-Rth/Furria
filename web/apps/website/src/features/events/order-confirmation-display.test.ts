import { describe, expect, it } from 'vitest';
import { SEEDED_EVENTS } from '@/lib/seed/events';
import type { Order } from '@/lib/seed/orders';
import { buildOrder, DEMO_ORDER } from '@/lib/seed/orders';
import {
  buildOrderSummaryRows,
  deriveOrderTicketCountLabel,
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
  it('switches between the singular and the plural', () => {
    expect(deriveOrderTicketCountLabel(DEMO_ORDER)).toBe('2 Karten');
    expect(deriveOrderTicketCountLabel(singleTicketOrder())).toBe('1 Karte');
  });
});

describe('isDemoOrder', () => {
  it('marks the seeded example Bestellung and leaves every other one unmarked', () => {
    expect(isDemoOrder(DEMO_ORDER)).toBe(true);
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
  it('shows the evening, the Karten, the sum and the buyer, and never the order code', () => {
    const rows = buildOrderSummaryRows(DEMO_ORDER);

    expect(rows.map((row) => row.label)).toEqual([
      'Abend',
      'Termin',
      'Ort',
      'Karten',
      'Summe',
      'Bestellt von',
      'E-Mail',
    ]);
    for (const row of rows) {
      expect(row.value).not.toContain(DEMO_ORDER.orderCode);
    }
  });
});

describe('selectOrderCrossSellEvent', () => {
  it('offers the next evening that still sells Karten', () => {
    expect(selectOrderCrossSellEvent(SEEDED_EVENTS, DEMO_ORDER, NOW)?.id).toBe(
      'prunksitzung-2-2027',
    );
  });

  it('never offers the evening the Bestellung is already for', () => {
    const ownEveningOnly = SEEDED_EVENTS.filter((event) => event.id === DEMO_ORDER.event.id);

    expect(selectOrderCrossSellEvent(ownEveningOnly, DEMO_ORDER, NOW)).toBeNull();
  });

  it('skips every evening that cannot be bought and every one that has passed', () => {
    const blocked = SEEDED_EVENTS.filter(
      (event) => event.salesStatus !== 'onSale' && event.salesStatus !== 'almostSoldOut',
    );
    const afterTheSession = new Date('2027-06-01T12:00:00Z');

    expect(blocked.length).toBeGreaterThan(0);
    expect(selectOrderCrossSellEvent(blocked, DEMO_ORDER, NOW)).toBeNull();
    expect(selectOrderCrossSellEvent(SEEDED_EVENTS, DEMO_ORDER, afterTheSession)).toBeNull();
  });
});
