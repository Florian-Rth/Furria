import type { SpotPath } from '@furria/studio/choreography-motion';
import type { MixPlayer } from '@furria/studio/mix-player';
import type { CountMark, TimelineRange } from '@furria/studio/music-timeline';
import { stepRangeOf } from '@furria/studio/music-timeline';
import type { CueSide, StageDot, StageScene, ViewShare } from '@furria/studio/practice-stage';
import { cueSideOf, stageDotsAt, viewRouteOf } from '@furria/studio/practice-stage';
import type { StepWay } from '@furria/studio/practice-step-way';
import { stepWayOf } from '@furria/studio/practice-step-way';
import { shownStepOf } from '@furria/studio/practice-stepping';
import type { OwnCue } from '@furria/studio/practice-way';
import { cueOf, ownWayAt } from '@furria/studio/practice-way';
import type { StudioStep } from '@furria/studio/studio-schemas';
import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';

const NO_ROUTE: ViewShare[] = [];

export interface PracticeSceneFrame {
  dots: StageDot[];
  ghost: ViewShare[];
  way: StepWay | null;
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
  steps: readonly StudioStep[],
): PracticeSceneFrame => {
  const seconds = usePlaybackSeconds(player);
  const dots = stageDotsAt(scene, seconds);
  const way = ownPath === null ? null : ownWayAt(ownPath.keyframes, marks, seconds, loop);
  const route = way === null || way.phase === 'still' ? null : way.route;

  const ghost = route === null ? NO_ROUTE : viewRouteOf(route, scene.stage);
  const own = dots.find((dot) => dot.kind === 'own') ?? null;
  const step = shownStepOf(steps, seconds);
  const stepRange = step === null ? null : stepRangeOf(step);

  return {
    dots,
    ghost,
    way:
      ownPath === null || stepRange === null
        ? null
        : stepWayOf(ownPath, marks, stepRange, seconds, scene.stage),
    cue: way === null ? null : cueOf(way),
    own,
    cueSide: own === null ? 'above' : cueSideOf(own, ghost),
  };
};
