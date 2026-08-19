import type { OrderBuyer } from '@/lib/seed/orders';
import { OrderBuyerSchema } from '@/lib/seed/orders';
import type { OrderBuyerForm } from './schemas';

export const buildOrderBuyer = (values: OrderBuyerForm): OrderBuyer =>
  OrderBuyerSchema.parse(values);
