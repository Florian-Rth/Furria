import { useOrderQuery } from '@/features/events/api';
import type { Order } from '@/lib/seed/orders';

export type OrderSource =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; order: Order };

export const resolveOrderSource = (order: Order | undefined, hasFailed: boolean): OrderSource => {
  if (order !== undefined) {
    return { status: 'ready', order };
  }

  return hasFailed ? { status: 'error' } : { status: 'loading' };
};

export const useOrderSource = (orderCode: string): OrderSource => {
  const { data, isError } = useOrderQuery(orderCode);

  return resolveOrderSource(data, isError);
};
