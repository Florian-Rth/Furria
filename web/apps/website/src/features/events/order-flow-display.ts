import { formatClockTime, formatWeekdayAndDate } from '@/lib/date';
import { formatEuros } from '@/lib/money';
import type { Event } from '@/lib/seed/events';
import { ticketPanelCtaLabels, ticketPanelPriceLabel } from './event-detail-content';
import { buildEventDocumentTitle } from './event-detail-display';
import { buildEventHref, buildExchangeHref, buildOrderConfirmationHref } from './event-display';
import { nextEventDetailLabel } from './next-event-content';
import {
  orderFlowActionLabels,
  orderFlowDocumentTitlePrefix,
  orderFlowHeadlines,
  orderFlowNoticeSuffixes,
  orderFlowStepLabels,
  orderFlowStepSummaryLabels,
} from './order-flow-content';
import type { OrderFlowStep } from './order-flow-steps';
import { deriveNextOrderFlowStep, ORDER_FLOW_STEP_COUNT } from './order-flow-steps';
import { deriveSalesStatusLabel, isLiveSaleStatus } from './sales-status-display';
import type { BlockedFaceKind, TicketPanelCta } from './ticket-panel-display';
import { deriveTicketPanelFace, deriveTicketPanelNote } from './ticket-panel-display';

export const DEMO_ORDER_CODE = 'demo';

export type OrderFlowAction =
  | { kind: 'step'; label: string; step: OrderFlowStep }
  | { kind: 'link'; cta: TicketPanelCta };

export const buildOrderFlowDocumentTitle = (event: Event): string =>
  `${orderFlowDocumentTitlePrefix} ${buildEventDocumentTitle(event)}`;

export const deriveOrderFlowAction = (step: OrderFlowStep): OrderFlowAction => {
  const label = orderFlowActionLabels[step];
  const nextStep = deriveNextOrderFlowStep(step);
  if (nextStep === null) {
    return {
      kind: 'link',
      cta: { label, to: buildOrderConfirmationHref(DEMO_ORDER_CODE), emphasis: 'contained' },
    };
  }
  return { kind: 'step', label, step: nextStep };
};

export const deriveOrderFlowStepSummary = (step: OrderFlowStep): string =>
  `${orderFlowStepSummaryLabels.prefix} ${step} ${orderFlowStepSummaryLabels.connector} ${ORDER_FLOW_STEP_COUNT} · ${orderFlowStepLabels[step]}`;

export const deriveOrderFlowPriceLine = (event: Event): string | null =>
  event.priceCents === null ? null : `${formatEuros(event.priceCents)} ${ticketPanelPriceLabel}`;

export const deriveOrderFlowBackLabel = (event: Event): string => `← ${event.title}`;

export const deriveOrderFlowKicker = (event: Event, lead: string): string =>
  [
    lead,
    formatWeekdayAndDate(event.startsAt),
    `${formatClockTime(event.startsAt)} Uhr`,
    event.venue,
  ]
    .join(' · ')
    .toUpperCase();

const deriveScarceHeadline = (freeCount: number): string =>
  `${orderFlowHeadlines.scarcePrefix} ${freeCount} ${orderFlowHeadlines.scarceSuffix}`;

export const deriveOrderFlowHeadline = (event: Event): string => {
  const face = deriveTicketPanelFace(event);
  switch (face.kind) {
    case 'onSale':
      return face.scarce && event.freeCount !== null
        ? deriveScarceHeadline(event.freeCount)
        : orderFlowHeadlines.onSale;
    case 'announced':
      return orderFlowHeadlines.announced;
    case 'presale':
      return orderFlowHeadlines.presale;
    case 'soldOut':
      return orderFlowHeadlines.soldOut;
    case 'closed':
      return orderFlowHeadlines.closed;
    case 'cancelled':
      return orderFlowHeadlines.cancelled;
  }
};

export const deriveOrderFlowAvailabilityLabel = (event: Event): string => {
  const priceLine = deriveOrderFlowPriceLine(event);
  const statusLabel = deriveSalesStatusLabel(event);
  return priceLine === null ? statusLabel : `${priceLine} · ${statusLabel}`;
};

export interface OrderFlowCapacity {
  freeCount: number;
  capacity: number;
}

export const deriveOrderFlowCapacity = (event: Event): OrderFlowCapacity | null => {
  const { freeCount, capacity } = event;
  if (!isLiveSaleStatus(event.salesStatus) || freeCount === null || capacity === null) {
    return null;
  }
  return { freeCount, capacity };
};

export interface OrderFlowNotice {
  body: string;
  cta: TicketPanelCta;
}

const deriveOrderFlowExit = (event: Event, kind: BlockedFaceKind): TicketPanelCta =>
  kind === 'soldOut'
    ? { label: ticketPanelCtaLabels.exchange, to: buildExchangeHref(), emphasis: 'contained' }
    : { label: nextEventDetailLabel, to: buildEventHref(event.id), emphasis: 'contained' };

export const deriveOrderFlowNotice = (event: Event): OrderFlowNotice | null => {
  const face = deriveTicketPanelFace(event);
  if (face.kind === 'onSale') {
    return null;
  }
  const stateSentence = deriveTicketPanelNote(face);
  if (stateSentence === null) {
    return null;
  }
  return {
    body: `${stateSentence} ${orderFlowNoticeSuffixes[face.kind]}`,
    cta: deriveOrderFlowExit(event, face.kind),
  };
};
