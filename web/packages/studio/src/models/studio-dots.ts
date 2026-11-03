import { posesAt } from '@furria/studio/choreography-motion';
import type { StageDot, StageScene } from '@furria/studio/practice-stage';
import { stageDotsAt } from '@furria/studio/practice-stage';
import type { StageFrame } from '@furria/studio/stage-framing';
import { viewRotationOf } from '@furria/studio/stage-view';
import { dotLabelOf } from '@furria/studio/studio-copy';

export interface StudioDot extends StageDot {
  label: string;
  selected: boolean;
  dimmed: boolean;
}

export const studioDotsAt = (
  scene: StageScene,
  seconds: number,
  selected: readonly number[],
  dimOthers: boolean,
): StudioDot[] => {
  const facings = new Map(
    posesAt(scene.paths, seconds).map((pose) => [pose.spotId, pose.facingDegrees]),
  );
  const names = new Map(scene.spots.map((spot) => [spot.spotId, spot.person?.firstName ?? null]));
  const someSelected = dimOthers && selected.length > 0;

  return stageDotsAt(scene, seconds).map((dot) => {
    const chosen = selected.includes(dot.spotId);

    return {
      ...dot,
      turn: viewRotationOf(facings.get(dot.spotId) ?? null, 'dancers'),
      label: dotLabelOf(dot.number, names.get(dot.spotId) ?? null),
      selected: chosen,
      dimmed: someSelected && !chosen,
    };
  });
};

export type SelectionSide = 'above' | 'below';

export interface SelectionAnchor {
  x: number;
  y: number;
  side: SelectionSide;
}

const ROOM_ABOVE = 0.2;

export const selectionAnchorOf = (
  dots: readonly StudioDot[],
  frame: StageFrame,
): SelectionAnchor | null => {
  const chosen = dots.filter((dot) => dot.selected);
  if (chosen.length === 0) {
    return null;
  }
  const x = chosen.reduce((sum, dot) => sum + dot.x, 0) / chosen.length;
  const top = Math.min(...chosen.map((dot) => dot.y));

  return top - frame.top < ROOM_ABOVE * frame.height
    ? { x, y: Math.max(...chosen.map((dot) => dot.y)), side: 'below' }
    : { x, y: top, side: 'above' };
};
