import { z } from 'zod';
import type { Event } from './events';
import { LocalDateTimeSchema, SEEDED_EVENTS } from './events';

export const DEMO_ORDER_CODE = 'demo';

export const PaymentStatusSchema = z.enum(['paid', 'processing']);

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const OrderBuyerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
});

export type OrderBuyer = z.infer<typeof OrderBuyerSchema>;

export const OrderEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  venue: z.string().min(1),
  startsAt: LocalDateTimeSchema,
});

export type OrderEvent = z.infer<typeof OrderEventSchema>;

export const OrderSchema = z.object({
  orderCode: z.string().min(1),
  event: OrderEventSchema,
  ticketCount: z.number().int().positive(),
  unitPriceCents: z.number().int().positive(),
  totalCents: z.number().int().positive(),
  buyer: OrderBuyerSchema,
  paymentStatus: PaymentStatusSchema,
});

export type Order = z.infer<typeof OrderSchema>;

export interface OrderFacts {
  orderCode: string;
  event: Event;
  ticketCount: number;
  buyer: OrderBuyer;
  paymentStatus: PaymentStatus;
}

export const buildOrder = ({
  orderCode,
  event,
  ticketCount,
  buyer,
  paymentStatus,
}: OrderFacts): Order => {
  if (event.priceCents === null) {
    throw new Error(`Order "${orderCode}" references event "${event.id}" without a price`);
  }
  return OrderSchema.parse({
    orderCode,
    event: { id: event.id, title: event.title, venue: event.venue, startsAt: event.startsAt },
    ticketCount,
    unitPriceCents: event.priceCents,
    totalCents: ticketCount * event.priceCents,
    buyer,
    paymentStatus,
  });
};

const requireSeededEvent = (eventId: string): Event => {
  const event = SEEDED_EVENTS.find((candidate) => candidate.id === eventId);
  if (event === undefined) {
    throw new Error(`The demo order references the unseeded event "${eventId}"`);
  }
  return event;
};

export const DEMO_ORDER: Order = buildOrder({
  orderCode: DEMO_ORDER_CODE,
  event: requireSeededEvent('prunksitzung-1-2027'),
  ticketCount: 2,
  buyer: {
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'max.mustermann@example.org',
  },
  paymentStatus: 'paid',
});
