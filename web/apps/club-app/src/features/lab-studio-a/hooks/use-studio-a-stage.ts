import type { KkStudioAStageWayPoint } from '@furria/ui/KkStudioAStage';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { stepRangeOf } from '@/features/act-player/music-timeline';
import type { Studio, StudioStage } from '@/features/acts/schemas';
import { openTagOf, ownTagOf } from '../studio-a-copy';
import type { StudioAStageScene } from '../studio-a-stage';
import { ownPathOf } from '../studio-a-stage';
import type { StudioAPractice } from './use-studio-a-practice';

export interface StudioAStageView {
  scene: StudioAStageScene;
  stage: StudioStage;
  aspect: number;
  ownTag: string | null;
  openTag: string | null;
  way: KkStudioAStageWayPoint[];
}

export const useStudioAStage = (
  studio: Studio,
  playback: StudioPlayback,
  practice: StudioAPractice,
  mirrored: boolean,
): StudioAStageView => {
  const { stage, paths, ownSpotId } = playback;
  const scene: StudioAStageScene = { paths, spots: studio.spots, ownSpotId, stage, mirrored };
  const ownSpot = studio.spots.find((spot) => spot.spotId === ownSpotId) ?? null;
  const open = studio.spots.filter((spot) => spot.person === null).length;
  const range = practice.step === null ? null : stepRangeOf(practice.step);

  return {
    scene,
    stage,
    aspect: stage.depthMetres / stage.widthMetres,
    ownTag: ownSpot === null ? null : ownTagOf(ownSpot.number),
    openTag: open === 0 ? null : openTagOf(open),
    way: ownPathOf(scene, range),
  };
};
