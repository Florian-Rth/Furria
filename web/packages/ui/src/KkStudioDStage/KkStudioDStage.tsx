import { KkStudioDStageRoot } from './internal/layout/KkStudioDStageRoot';
import { KkStudioDStageDot } from './internal/ui/KkStudioDStageDot';
import { KkStudioDStageWay } from './internal/ui/KkStudioDStageWay';

export type { KkStudioDStageSize } from './internal/layout/KkStudioDStageRoot';
export type { KkStudioDStageDotKind } from './internal/ui/KkStudioDStageDot';
export type { KkStudioDStageWayPoint } from './internal/ui/KkStudioDStageWay';

export const KkStudioDStage = Object.assign(KkStudioDStageRoot, {
  Dot: KkStudioDStageDot,
  Way: KkStudioDStageWay,
});
