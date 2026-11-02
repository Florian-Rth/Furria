import type { SpotPath } from '@furria/studio/choreography-motion';
import type { TimelineRange } from '@furria/studio/music-timeline';
import type { StudioSpot, StudioStage } from '@furria/studio/studio-schemas';
import type { ScoreDot } from './score-formation';
import { formationAt } from './score-formation';

export interface LiveScene {
  paths: readonly SpotPath[];
  spots: readonly StudioSpot[];
  stage: StudioStage;
  ownSpotId: number | null;
}

export const isInside = (range: TimelineRange | null, seconds: number): boolean =>
  range !== null && seconds > range.start && seconds < range.end;

export const liveDotsOf = (
  scene: LiveScene,
  range: TimelineRange | null,
  seconds: number,
  resting: ScoreDot[],
): ScoreDot[] =>
  isInside(range, seconds)
    ? formationAt(scene.paths, scene.spots, scene.stage, seconds, scene.ownSpotId).map((dot) => ({
        id: dot.spotId,
        x: dot.x,
        y: dot.y,
        own: dot.own,
        open: dot.open,
        number: dot.number,
        caption: dot.firstName,
      }))
    : resting;
