import { formatClockTime, formatWeekdayAndFullDate } from '@/lib/date';
import type { OrderBuyer, OrderEvent } from '@/lib/seed/orders';
import { orderSummaryLabels } from './order-summary-content';

export interface OrderSummaryRow {
  label: string;
  value: string;
}

export const deriveOrderDateLine = (startsAt: string): string =>
  `${formatWeekdayAndFullDate(startsAt)} · ${formatClockTime(startsAt)} Uhr`;

export const deriveOrderBuyerName = (buyer: OrderBuyer): string =>
  `${buyer.firstName} ${buyer.lastName}`;

export const buildOrderEventRows = (event: OrderEvent): OrderSummaryRow[] => [
  { label: orderSummaryLabels.event, value: event.title },
  { label: orderSummaryLabels.date, value: deriveOrderDateLine(event.startsAt) },
  { label: orderSummaryLabels.venue, value: event.venue },
];

export const buildOrderBuyerRows = (buyer: OrderBuyer): OrderSummaryRow[] => [
  { label: orderSummaryLabels.buyer, value: deriveOrderBuyerName(buyer) },
  { label: orderSummaryLabels.email, value: buyer.email },
];

export const buildOrderDraftSummaryRows = (
  event: OrderEvent,
  buyer: OrderBuyer,
): OrderSummaryRow[] => [...buildOrderEventRows(event), ...buildOrderBuyerRows(buyer)];
