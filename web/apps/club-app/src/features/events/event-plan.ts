import type { KkStepState } from '@furria/ui/step-state';
import { fromIsoDay, toIsoDay } from '@/lib/day';
import type {
  EventStepKey,
  EventStepState,
  EventStepStatus,
  EventSummary,
  MissingEventDetail,
} from './schemas';

export type PlannedEvent = Pick<
  EventSummary,
  | 'eventId'
  | 'startsAt'
  | 'status'
  | 'isOver'
  | 'publishedAt'
  | 'createdAt'
  | 'priceCents'
  | 'presaleStartsAt'
  | 'detailsMissing'
  | 'ticketRequests'
  | 'review'
  | 'steps'
  | 'currentStep'
>;

const MS_PER_DAY = 86_400_000;

export type FactDetail = Exclude<MissingEventDetail, 'published'>;
export type TicketFact = 'price' | 'presale';

const dayStartOf = (isoDay: string): number => fromIsoDay(isoDay).getTime();

export const daysBetween = (fromDay: string, toDay: string): number =>
  Math.round((dayStartOf(toDay) - dayStartOf(fromDay)) / MS_PER_DAY);

export const daysUntilEvent = (startsAt: string, todayIsoDay: string): number =>
  daysBetween(todayIsoDay, toIsoDay(new Date(startsAt)));

export const isCancelledEvent = (event: Pick<PlannedEvent, 'status'>): boolean =>
  event.status === 'cancelled';

export const isInPreparation = (event: Pick<PlannedEvent, 'publishedAt' | 'status'>): boolean =>
  event.publishedAt === null && !isCancelledEvent(event);

export const stepStatusOf = (
  event: Pick<PlannedEvent, 'steps'>,
  step: EventStepKey,
): EventStepStatus | null => event.steps.find((status) => status.step === step) ?? null;

export const boardStateOf = (
  state: EventStepState,
  step: EventStepKey,
  currentStep: EventStepKey | null,
): KkStepState => {
  if (state === 'done' || state === 'overdue') {
    return state;
  }

  return step === currentStep ? 'current' : state;
};

export const leadShareOf = (
  event: Pick<PlannedEvent, 'createdAt' | 'startsAt'>,
  now: Date,
): number => {
  const start = new Date(event.createdAt).getTime();
  const end = new Date(event.startsAt).getTime();

  if (end <= start) {
    return 1;
  }

  return Math.min(Math.max((now.getTime() - start) / (end - start), 0), 1);
};

export const factDetailsOf = (missing: readonly MissingEventDetail[]): FactDetail[] =>
  missing.filter((detail): detail is FactDetail => detail !== 'published');

export const ticketFactsOf = (
  event: Pick<PlannedEvent, 'priceCents' | 'presaleStartsAt'>,
): TicketFact[] => {
  const missing: TicketFact[] = [];

  if (event.priceCents === null) {
    missing.push('price');
  }
  if (event.presaleStartsAt === null) {
    missing.push('presale');
  }

  return missing;
};

export const waitingDaysOf = (oldestRequestedAt: string | null, todayIsoDay: string): number =>
  oldestRequestedAt === null
    ? 0
    : Math.max(daysBetween(toIsoDay(new Date(oldestRequestedAt)), todayIsoDay), 0);

export type PublishState = 'published' | 'ready' | 'blocked' | 'closed';

export const publishStateOf = (
  event: Pick<PlannedEvent, 'publishedAt' | 'status' | 'isOver' | 'detailsMissing'>,
): PublishState => {
  if (event.publishedAt !== null) {
    return 'published';
  }
  if (isCancelledEvent(event) || event.isOver) {
    return 'closed';
  }

  return factDetailsOf(event.detailsMissing).length === 0 ? 'ready' : 'blocked';
};
