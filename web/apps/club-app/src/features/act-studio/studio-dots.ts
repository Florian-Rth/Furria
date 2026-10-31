import { posesAt } from '@/features/act-player/choreography-motion';
import { viewRotationOf } from '@/features/act-player/stage-view';
import type { StageDot, StageScene } from '@/features/act-practice/practice-stage';
import { stageDotsAt } from '@/features/act-practice/practice-stage';
import { dotLabelOf } from './studio-copy';

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
