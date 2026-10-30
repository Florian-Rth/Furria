import { KkWayStageCorner } from './internal/layout/KkWayStageCorner';
import { KkWayStageRoot } from './internal/layout/KkWayStageRoot';
import { KkWayStageWorld } from './internal/layout/KkWayStageWorld';
import { KkWayStageCue } from './internal/ui/KkWayStageCue';
import { KkWayStageDot } from './internal/ui/KkWayStageDot';
import { KkWayStagePath } from './internal/ui/KkWayStagePath';
import { KkWayStageTick } from './internal/ui/KkWayStageTick';

export type { KkWayStageCamera } from './internal/layout/KkWayStageWorld';
export type { KkWayStageCueSide, KkWayStageCueTone } from './internal/ui/KkWayStageCue';
export type { KkWayStageDotKind } from './internal/ui/KkWayStageDot';
export type { KkWayStagePoint } from './internal/ui/KkWayStagePath';

export const KkWayStage = Object.assign(KkWayStageRoot, {
  World: KkWayStageWorld,
  Corner: KkWayStageCorner,
  Dot: KkWayStageDot,
  Path: KkWayStagePath,
  Tick: KkWayStageTick,
  Cue: KkWayStageCue,
});
