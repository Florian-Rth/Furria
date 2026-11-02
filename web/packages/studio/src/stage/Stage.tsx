import { StageRoot } from './internal/layout/StageRoot';
import { StageCount } from './internal/ui/StageCount';
import { StageCue } from './internal/ui/StageCue';
import { StageDot } from './internal/ui/StageDot';
import { StagePath } from './internal/ui/StagePath';
import { StageTarget } from './internal/ui/StageTarget';

export type { StageEntrance } from './internal/layout/StagePlace';
export type { StageFit, StageFloor } from './internal/layout/StageRoot';
export type { StageNameSide } from './internal/ui/StageDot';

export const Stage = Object.assign(StageRoot, {
  Count: StageCount,
  Cue: StageCue,
  Dot: StageDot,
  Path: StagePath,
  Target: StageTarget,
});
