import type { KkPracticeStageGhostPoint } from '@furria/ui/KkPracticeStage';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import type { CueSide, StageDot, StageScene } from '../practice-stage';
import { cueSideOf, stageDotsAt, viewRouteOf } from '../practice-stage';
import type { OwnCue } from '../practice-way';
import { cueOf, ownWayAt } from '../practice-way';

const NO_ROUTE: KkPracticeStageGhostPoint[] = [];

export interface PracticeSceneFrame {
  dots: StageDot[];
  ghost: KkPracticeStageGhostPoint[];
  cue: OwnCue | null;
  own: StageDot | null;
  cueSide: CueSide;
}

export const usePracticeScene = (
  player: MixPlayer,
  scene: StageScene,
  ownPath: SpotPath | null,
  marks: readonly CountMark[],
  loop: TimelineRange | null,
): PracticeSceneFrame => {
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
