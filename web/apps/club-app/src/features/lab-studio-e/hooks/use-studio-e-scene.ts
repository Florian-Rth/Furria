import type { KkStudioEStageGhostPoint } from '@furria/ui/KkStudioEStage';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import type { CueSide, StageDot, StageScene } from '../studio-e-stage';
import { cueSideOf, stageDotsAt, viewRouteOf } from '../studio-e-stage';
import type { OwnCue } from '../studio-e-way';
import { cueOf, ownWayAt } from '../studio-e-way';

const NO_ROUTE: KkStudioEStageGhostPoint[] = [];

export interface StudioESceneFrame {
  dots: StageDot[];
  ghost: KkStudioEStageGhostPoint[];
  cue: OwnCue | null;
  own: StageDot | null;
  cueSide: CueSide;
}

export const useStudioEScene = (
  player: MixPlayer,
  scene: StageScene,
  ownPath: SpotPath | null,
  marks: readonly CountMark[],
  loop: TimelineRange | null,
): StudioESceneFrame => {
  const seconds = usePlaybackSeconds(player);
  const dots = stageDotsAt(scene, seconds);
  const way = ownPath === null ? null : ownWayAt(ownPath.keyframes, marks, seconds, loop);
  const route = way === null || way.phase === 'still' ? null : way.route;

  const ghost = route === null ? NO_ROUTE : viewRouteOf(route, scene.stage);
  const own = dots.find((dot) => dot.kind === 'own') ?? null;

  return {
    dots,
    ghost,
    cue: way === null ? null : cueOf(way),
    own,
    cueSide: own === null ? 'above' : cueSideOf(own, ghost),
  };
};
