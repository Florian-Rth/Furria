import { eveningSlotOf } from '@/features/act-card/act-card-model';
import type { StudioEvening } from '@/features/acts/schemas';

const TRAINING_GRACE_MS = 2 * 60 * 60 * 1000;
const EVENING_GRACE_MS = 6 * 60 * 60 * 1000;

export interface ActEvening {
  eventId: number;
  title: string;
  startsAt: string;
  number: number | null;
}

const timeOf = (iso: string): number => new Date(iso).getTime();

const byStart = (left: { startsAt: string }, right: { startsAt: string }): number =>
  timeOf(left.startsAt) - timeOf(right.startsAt);

export const eveningNumberOf = (evening: StudioEvening): number | null => {
  const slot = eveningSlotOf(evening.appearance?.position);

  return slot.kind === 'placed' ? slot.number : null;
};

export const actEveningsOf = (evenings: readonly StudioEvening[], now: number): ActEvening[] =>
  evenings
    .filter(
      (evening) =>
        evening.appearance !== null && timeOf(evening.startsAt) + EVENING_GRACE_MS >= now,
    )
    .toSorted(byStart)
    .map((evening) => ({
      eventId: evening.eventId,
      title: evening.title,
      startsAt: evening.startsAt,
      number: eveningNumberOf(evening),
    }));

export const nextTrainingOf = <T extends { startsAt: string }>(
  trainings: readonly T[],
  now: number,
): T | null =>
  trainings
    .filter((training) => timeOf(training.startsAt) + TRAINING_GRACE_MS >= now)
    .toSorted(byStart)[0] ?? null;

export const nextEveningOf = (
  evenings: readonly StudioEvening[],
  now: number,
): StudioEvening | null =>
  evenings
    .filter(
      (evening) =>
        evening.appearance !== null && timeOf(evening.startsAt) + EVENING_GRACE_MS >= now,
    )
    .toSorted(byStart)[0] ?? null;
