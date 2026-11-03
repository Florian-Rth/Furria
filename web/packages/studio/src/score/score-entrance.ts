import type { FormationDot } from '@furria/studio/score-formation';

const ENTRANCE_LEAD_SECONDS = 0.45;
const ENTRANCE_STAGGER_SECONDS = 0.07;
const CENTRE = 0.5;
const FRONT = 1;

export interface EnteringDot extends FormationDot {
  fromX: number;
  fromY: number;
}

export const enteringDotsOf = (
  dots: readonly FormationDot[],
  before: readonly FormationDot[] | null,
): EnteringDot[] =>
  dots.map((dot) => {
    const earlier = before?.find((candidate) => candidate.spotId === dot.spotId);

    return {
      ...dot,
      fromX: earlier?.x ?? CENTRE,
      fromY: earlier?.y ?? FRONT,
    };
  });

export const entranceDelayOf = (index: number): number =>
  ENTRANCE_LEAD_SECONDS + index * ENTRANCE_STAGGER_SECONDS;
