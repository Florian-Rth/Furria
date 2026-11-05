import type { HallSummary, TablePlanSummary } from '@/features/hall-plan/schemas';

export interface HallOption {
  hallId: number;
  name: string;
  venueName: string;
  isEventVenue: boolean;
}

const COLLATOR = new Intl.Collator('de-DE');

export const hallOptionsOf = (
  halls: readonly HallSummary[],
  eventVenueId: number | null,
): HallOption[] =>
  halls
    .map((hall) => ({
      hallId: hall.hallId,
      name: hall.name,
      venueName: hall.venueName,
      isEventVenue: hall.venueId === eventVenueId,
    }))
    .sort(
      (left, right) =>
        Number(right.isEventVenue) - Number(left.isEventVenue) ||
        COLLATOR.compare(left.venueName, right.venueName) ||
        COLLATOR.compare(left.name, right.name),
    );

export const copySourcesOf = (
  plans: readonly TablePlanSummary[],
  eventId: number,
): TablePlanSummary[] =>
  plans
    .filter((plan) => plan.eventId !== eventId)
    .sort((left, right) => right.startsAt.localeCompare(left.startsAt));

const FALLBACK_HALL_NAME = 'Saal';

export const newHallNameOf = (
  halls: readonly HallSummary[],
  venueId: number,
  venueName: string | null,
): string => {
  const taken = new Set(halls.filter((hall) => hall.venueId === venueId).map((hall) => hall.name));
  const base = venueName ?? FALLBACK_HALL_NAME;
  if (!taken.has(base)) {
    return base;
  }
  let counter = 2;
  while (taken.has(`${base} ${counter}`)) {
    counter += 1;
  }

  return `${base} ${counter}`;
};
