import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { StageDotKind } from '@/features/act-practice/practice-stage';
import type { StudioSpot, StudioStage } from '@/features/acts/schemas';
import type { FormationDraft, SpotMove } from './studio-i-formation';
import { spotMovesOf } from './studio-i-formation';
import type { StepSpan } from './studio-i-spans';

export interface StepScene {
  paths: readonly SpotPath[];
  spots: readonly StudioSpot[];
  ownSpotId: number | null;
  stage: StudioStage;
}

export const dotKindOf = (spot: StudioSpot | undefined, ownSpotId: number | null): StageDotKind => {
  if (spot !== undefined && spot.spotId === ownSpotId) {
    return 'own';
  }

  return spot?.person === null || spot === undefined ? 'open' : 'cast';
};

export const movesOfStep = (
  scene: StepScene,
  span: StepSpan,
  formation: FormationDraft,
): SpotMove[] => spotMovesOf(scene.paths, span, span.stepId, formation);
