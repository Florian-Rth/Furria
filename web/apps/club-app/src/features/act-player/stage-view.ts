import type { StudioStage } from '@/features/acts/schemas';
import type { StagePoint } from './choreography-motion';

const CENTRE_DIVISOR = 2;
const HALF_TURN_DEGREES = 180;
const FULL_TURN_DEGREES = 360;
const DEFAULT_STAGE: StudioStage = { widthMetres: 10, depthMetres: 8, artworkSvg: null };

export type StageViewpoint = 'audience' | 'dancers';

export interface ViewPoint {
  x: number;
  y: number;
}

export const stageOrDefault = (stage: StudioStage | null): StudioStage => stage ?? DEFAULT_STAGE;

export const viewPointOf = (
  point: StagePoint,
  stage: StudioStage,
  viewpoint: StageViewpoint,
): ViewPoint =>
  viewpoint === 'audience'
    ? {
        x: stage.widthMetres / CENTRE_DIVISOR + point.rightMetres,
        y: stage.depthMetres - point.backMetres,
      }
    : { x: stage.widthMetres / CENTRE_DIVISOR - point.rightMetres, y: point.backMetres };

export const viewRotationOf = (
  facingDegrees: number | null,
  viewpoint: StageViewpoint,
): number | null => {
  if (facingDegrees === null) {
    return null;
  }

  return viewpoint === 'audience'
    ? facingDegrees
    : (facingDegrees + HALF_TURN_DEGREES) % FULL_TURN_DEGREES;
};

export const artworkSourceOf = (stage: StudioStage): string | null =>
  stage.artworkSvg === null
    ? null
    : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(stage.artworkSvg)}`;
