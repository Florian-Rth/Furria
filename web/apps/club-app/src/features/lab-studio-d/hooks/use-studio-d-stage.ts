import type { KkStudioDStageWayPoint } from '@furria/ui/KkStudioDStage';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { stepRangeOf } from '@/features/act-player/music-timeline';
import type { Studio, StudioStage, StudioStep } from '@/features/acts/schemas';
import type { StudioDStageScene } from '../studio-d-stage';
import { ownPathOf } from '../studio-d-stage';

export interface StudioDStageView {
  scene: StudioDStageScene;
  stage: StudioStage;
  aspect: number;
  way: KkStudioDStageWayPoint[];
}

export const useStudioDStage = (
  studio: Studio,
  playback: StudioPlayback,
  mirrored: boolean,
  step: StudioStep | null,
): StudioDStageView => {
  const { stage, paths, ownSpotId } = playback;
  const scene: StudioDStageScene = { paths, spots: studio.spots, ownSpotId, stage, mirrored };
  const range = step === null ? null : stepRangeOf(step);

  return {
    scene,
    stage,
    aspect: stage.widthMetres / stage.depthMetres,
    way: ownPathOf(scene, range),
  };
};
