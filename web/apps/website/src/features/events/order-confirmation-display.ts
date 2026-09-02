import { parseBerlinDateTime } from '@/lib/date';
import { formatEuros } from '@/lib/money';
import type { Event } from '@/lib/seed/events';
import type { Order, PaymentStatus } from '@/lib/seed/orders';
import { DEMO_ORDER_CODE } from '@/lib/seed/orders';
import { ticketPanelPriceLabel } from './event-detail-content';
import { selectOfferedEventsByDate } from './event-display';
import { orderTicketCountLabels } from './order-confirmation-content';
import { orderSummaryLabels } from './order-summary-content';
import type { OrderSummaryRow } from './order-summary-display';
import { buildOrderBuyerRows, buildOrderEventRows } from './order-summary-display';
import { isLiveSaleStatus } from './sales-status-display';

export type PaymentStatusColor = 'success' | 'info';

const COLOR_BY_PAYMENT_STATUS: Record<PaymentStatus, PaymentStatusColor> = {
  paid: 'success',
  processing: 'info',
};

export const isDemoOrder = (order: Order): boolean => order.orderCode === DEMO_ORDER_CODE;

export const derivePaymentStatusColor = (status: PaymentStatus): PaymentStatusColor =>
  COLOR_BY_PAYMENT_STATUS[status];

export const deriveOrderTicketCountLabel = (order: Order): string => {
  const noun = order.ticketCount === 1 ? orderTicketCountLabels.one : orderTicketCountLabels.many;
  return `${order.ticketCount} ${noun}`;
};

export const deriveOrderTicketLine = (order: Order): string =>
  `${deriveOrderTicketCountLabel(order)} · ${formatEuros(order.unitPriceCents)} ${ticketPanelPriceLabel}`;

export const deriveOrderTotalLabel = (order: Order): string => formatEuros(order.totalCents);

export const buildOrderSummaryRows = (order: Order): OrderSummaryRow[] => [
  ...buildOrderEventRows(order.event),
  { label: orderSummaryLabels.tickets, value: deriveOrderTicketLine(order) },
  { label: orderSummaryLabels.total, value: deriveOrderTotalLabel(order) },
  ...buildOrderBuyerRows(order.buyer),
];

export const selectOrderCrossSellEvent = (events: Event[], order: Order, now: Date): Event | null =>
  selectOfferedEventsByDate(events).find(
    (event) =>
      event.id !== order.event.id &&
      isLiveSaleStatus(event.salesStatus) &&
      parseBerlinDateTime(event.startsAt) > now,
  ) ?? null;
