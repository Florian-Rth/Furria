import { describe, expect, it } from 'vitest';
import type { Event } from './events';
import { SEEDED_EVENTS } from './events';
import type { OrderBuyer, OrderFacts } from './orders';
import {
  buildOrder,
  DEMO_ORDER,
  DEMO_ORDER_CODE,
  OrderSchema,
  PaymentStatusSchema,
} from './orders';

const seededEvent = (eventId: string): Event => {
  const event = SEEDED_EVENTS.find((candidate) => candidate.id === eventId);
  if (event === undefined) {
    throw new Error(`missing seeded event: ${eventId}`);
  }
  return event;
};

const buyer: OrderBuyer = {
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max.mustermann@example.org',
};

const baseFacts: OrderFacts = {
  orderCode: 'demo',
  event: seededEvent('prunksitzung-1-2027'),
  ticketCount: 2,
  buyer,
  paymentStatus: 'paid',
};

describe('buildOrder', () => {
  it('prices the Karten from the evening and sums them up', () => {
    const order = buildOrder(baseFacts);

    expect(order.unitPriceCents).toBe(1400);
    expect(order.totalCents).toBe(2800);
  });

  it('keeps the sum the count times the price for any count', () => {
    const order = buildOrder({ ...baseFacts, ticketCount: 5 });

    expect(order.totalCents).toBe(order.ticketCount * order.unitPriceCents);
  });

  it('carries only the identity of the evening, never its whole payload', () => {
    const order = buildOrder(baseFacts);

    expect(order.event).toEqual({
      id: 'prunksitzung-1-2027',
      title: '1. Prunksitzung',
      venue: 'Dorfgemeindehaus Großfurra',
      startsAt: '2027-01-23T19:11',
    });
  });

  it('rejects an evening that has no price to charge', () => {
    const priceless = seededEvent('rentnerfasching-2027');

    expect(() => buildOrder({ ...baseFacts, event: priceless })).toThrow(/without a price/);
  });

  it('rejects a Bestellung over no Karte at all', () => {
    expect(() => buildOrder({ ...baseFacts, ticketCount: 0 })).toThrow();
  });
});

describe('OrderSchema', () => {
  const payload = buildOrder(baseFacts);

  it('parses a valid payload unchanged', () => {
    expect(OrderSchema.parse(payload)).toEqual(payload);
  });

  it('drops fields the future endpoint may add', () => {
    expect(OrderSchema.parse({ ...payload, createdAt: '2026-12-01T12:00' })).toEqual(payload);
  });

  it('rejects a Karten count that is zero, negative or fractional', () => {
    expect(() => OrderSchema.parse({ ...payload, ticketCount: 0 })).toThrow();
    expect(() => OrderSchema.parse({ ...payload, ticketCount: -2 })).toThrow();
    expect(() => OrderSchema.parse({ ...payload, ticketCount: 1.5 })).toThrow();
  });

  it('rejects a buyer without a name or with an unusable address', () => {
    expect(() => OrderSchema.parse({ ...payload, buyer: { ...buyer, firstName: '' } })).toThrow();
    expect(() => OrderSchema.parse({ ...payload, buyer: { ...buyer, lastName: '' } })).toThrow();
    expect(() =>
      OrderSchema.parse({ ...payload, buyer: { ...buyer, email: 'keine-mail' } }),
    ).toThrow();
  });

  it('rejects a payment state the pages cannot render', () => {
    expect(() => OrderSchema.parse({ ...payload, paymentStatus: 'failed' })).toThrow();
  });

  it('rejects a timestamp that is not local minute precision', () => {
    expect(() =>
      OrderSchema.parse({ ...payload, event: { ...payload.event, startsAt: '23.01.2027 19:11' } }),
    ).toThrow();
  });
});

describe('PaymentStatusSchema', () => {
  it('knows a paid and a pending Bestellung and no failed one', () => {
    expect(PaymentStatusSchema.options).toEqual(['paid', 'processing']);
  });
});

describe('DEMO_ORDER', () => {
  it('parses as the future endpoint payload', () => {
    expect(OrderSchema.parse(DEMO_ORDER)).toEqual(DEMO_ORDER);
  });

  it('answers exactly the demo code', () => {
    expect(DEMO_ORDER.orderCode).toBe(DEMO_ORDER_CODE);
    expect(DEMO_ORDER_CODE).toBe('demo');
  });

  it('shows a paid Bestellung', () => {
    expect(DEMO_ORDER.paymentStatus).toBe('paid');
  });

  it('reads as an obvious placeholder and not as a real person', () => {
    expect(DEMO_ORDER.buyer.firstName).toBe('Max');
    expect(DEMO_ORDER.buyer.lastName).toBe('Mustermann');
    expect(DEMO_ORDER.buyer.email).toMatch(/@example\.org$/);
  });

  it('stays consistent with the seeded evening it references', () => {
    const event = seededEvent(DEMO_ORDER.event.id);

    expect(DEMO_ORDER.event.title).toBe(event.title);
    expect(DEMO_ORDER.event.venue).toBe(event.venue);
    expect(DEMO_ORDER.event.startsAt).toBe(event.startsAt);
    expect(DEMO_ORDER.unitPriceCents).toBe(event.priceCents);
    expect(DEMO_ORDER.totalCents).toBe(DEMO_ORDER.ticketCount * DEMO_ORDER.unitPriceCents);
  });
});
