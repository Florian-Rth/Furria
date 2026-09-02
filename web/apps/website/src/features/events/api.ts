import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Event } from '@/lib/seed/events';
import { EventsSchema, SEEDED_EVENTS } from '@/lib/seed/events';
import type { Order } from '@/lib/seed/orders';
import { DEMO_ORDER, DEMO_ORDER_CODE, OrderSchema } from '@/lib/seed/orders';

export const eventKeys = {
  all: ['events'] as const,
};

const fetchEvents = (): Promise<Event[]> => Promise.resolve(EventsSchema.parse(SEEDED_EVENTS));

export const useEventsQuery = (): UseQueryResult<Event[], Error> =>
  useQuery({ queryKey: eventKeys.all, queryFn: fetchEvents });

export const orderKeys = {
  detail: (orderCode: string): readonly ['orders', string] => ['orders', orderCode] as const,
};

const fetchOrder = (orderCode: string): Promise<Order> =>
  orderCode === DEMO_ORDER_CODE
    ? Promise.resolve(OrderSchema.parse(DEMO_ORDER))
    : Promise.reject(new Error(`No order exists for the code "${orderCode}"`));

export const useOrderQuery = (orderCode: string): UseQueryResult<Order, Error> =>
  useQuery({
    queryKey: orderKeys.detail(orderCode),
    queryFn: (): Promise<Order> => fetchOrder(orderCode),
    retry: false,
  });
