const TRAINING_GRACE_MS = 2 * 60 * 60 * 1000;

const timeOf = (iso: string): number => new Date(iso).getTime();

const byStart = (left: { startsAt: string }, right: { startsAt: string }): number =>
  timeOf(left.startsAt) - timeOf(right.startsAt);

export const nextTrainingOf = <T extends { startsAt: string }>(
  trainings: readonly T[],
  now: number,
): T | null =>
  trainings
    .filter((training) => timeOf(training.startsAt) + TRAINING_GRACE_MS >= now)
    .toSorted(byStart)[0] ?? null;
