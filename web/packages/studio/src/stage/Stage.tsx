import { StageFloat } from './internal/layout/StageFloat';
import { StageRoot } from './internal/layout/StageRoot';
import { StageCount } from './internal/ui/StageCount';
import { StageCue } from './internal/ui/StageCue';
import { StageDot } from './internal/ui/StageDot';
import { StageEcho } from './internal/ui/StageEcho';
import { StageGrid } from './internal/ui/StageGrid';
import { StageHandle } from './internal/ui/StageHandle';
import { StageKey } from './internal/ui/StageKey';
import { StagePath } from './internal/ui/StagePath';
import { StageTarget } from './internal/ui/StageTarget';

export type { StageFloatSide } from './internal/layout/StageFloat';
export type { StageEntrance } from './internal/layout/StagePlace';
export type { StageFit, StageFloor, StageFrameChange } from './internal/layout/StageRoot';
export type { StageDotKeys, StageNameSide } from './internal/ui/StageDot';
export type { StageWork } from './stage-work';

export const Stage = Object.assign(StageRoot, {
  Count: StageCount,
  Cue: StageCue,
  Dot: StageDot,
  Echo: StageEcho,
  Float: StageFloat,
  Grid: StageGrid,
  Handle: StageHandle,
  Key: StageKey,
  Path: StagePath,
  Target: StageTarget,
});
