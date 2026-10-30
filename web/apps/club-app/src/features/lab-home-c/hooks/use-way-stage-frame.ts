import type { SpotPath } from '@/features/act-player/choreography-motion';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import type {
  CueSide,
  StageDot,
  StageScene,
  ViewShare,
} from '@/features/act-practice/practice-stage';
import {
  cueSideOf,
  stageDotsAt,
  viewRouteOf,
  viewShareOf,
} from '@/features/act-practice/practice-stage';
import type { OwnCue } from '@/features/act-practice/practice-way';
import { cueOf, ownWayAt } from '@/features/act-practice/practice-way';
import type { WayCamera } from '../way-camera';
import { cameraOf, WHOLE_STAGE } from '../way-camera';
import type { ShownTick } from '../way-ticks';
import { spacedTicksOf, wayTicksAt } from '../way-ticks';

const NO_ROUTE: ViewShare[] = [];
const TICK_GAP = 0.065;

export interface WayStageFrame {
  dots: StageDot[];
  route: ViewShare[];
  ticks: ShownTick[];
  cue: OwnCue | null;
  own: StageDot | null;
  cueSide: CueSide;
  camera: WayCamera;
}

interface WayStageInput {
  player: MixPlayer;
  scene: StageScene;
  ownPath: SpotPath | null;
  marks: readonly CountMark[];
  loop: TimelineRange | null;
  reach: readonly ViewShare[];
  near: boolean;
}

export const useWayStageFrame = ({
  player,
  scene,
  ownPath,
  marks,
  loop,
  reach,
  near,
}: WayStageInput): WayStageFrame => {
  const seconds = usePlaybackSeconds(player);
  const dots = stageDotsAt(scene, seconds);
  const way = ownPath === null ? null : ownWayAt(ownPath.keyframes, marks, seconds, loop);
  const route =
    way === null || way.phase === 'still' ? NO_ROUTE : viewRouteOf(way.route, scene.stage);
  const own = dots.find((dot) => dot.kind === 'own') ?? null;
  const ownPoint = own === null ? [] : [own];
  const camera = near ? cameraOf([...reach, ...route, ...ownPoint], scene.stage) : WHOLE_STAGE;
  const aspect = scene.stage.depthMetres / scene.stage.widthMetres;
  const ticks =
    ownPath === null
      ? []
      : wayTicksAt(ownPath.keyframes, marks, seconds, loop).map((tick) => ({
          key: String(tick.seconds),
          count: tick.labelled ? tick.count : null,
          ...viewShareOf(tick.point, scene.stage),
        }));

  return {
    dots,
    route,
    ticks: spacedTicksOf(ticks, own, TICK_GAP / camera.scale, aspect),
    cue: way === null ? null : cueOf(way),
    own,
    cueSide: own === null ? 'above' : cueSideOf(own, route),
    camera,
  };
};
