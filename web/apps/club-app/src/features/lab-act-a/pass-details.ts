import type { Studio } from '@/features/acts/schemas';

export interface PassScheduleCounts {
  placed: number;
  joined: number;
  trainings: number;
  openSpots: number;
}

export const scheduleCountsOf = (studio: Studio): PassScheduleCounts => {
  const appearances = studio.evenings.flatMap((evening) =>
    evening.appearance === null ? [] : [evening.appearance],
  );
  const placed = appearances.filter((appearance) => appearance.position !== null).length;

  return {
    placed,
    joined: appearances.length - placed,
    trainings: studio.trainings.length,
    openSpots: studio.trainings.reduce((sum, training) => sum + training.openSpotIds.length, 0),
  };
};
