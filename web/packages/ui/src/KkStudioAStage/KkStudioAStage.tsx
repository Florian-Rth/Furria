import { KkStudioAStageRoot } from './internal/layout/KkStudioAStageRoot';
import { KkStudioAStageDot } from './internal/ui/KkStudioAStageDot';
import { KkStudioAStageTag } from './internal/ui/KkStudioAStageTag';
import { KkStudioAStageWay } from './internal/ui/KkStudioAStageWay';

export type { KkStudioAStageDotKind } from './internal/ui/KkStudioAStageDot';
export type { KkStudioAStageTagMark } from './internal/ui/KkStudioAStageTag';
export type { KkStudioAStageWayPoint } from './internal/ui/KkStudioAStageWay';

export const KkStudioAStage = Object.assign(KkStudioAStageRoot, {
  Dot: KkStudioAStageDot,
  Way: KkStudioAStageWay,
  Tag: KkStudioAStageTag,
});
