import { KkStudioHStageRoot } from './internal/layout/KkStudioHStageRoot';
import { KkStudioHStageDot } from './internal/ui/KkStudioHStageDot';
import { KkStudioHStageOnion } from './internal/ui/KkStudioHStageOnion';
import { KkStudioHStagePath } from './internal/ui/KkStudioHStagePath';

export type { KkStudioHStageDotKind } from './internal/ui/KkStudioHStageDot';
export type { KkStudioHStagePoint } from './internal/ui/KkStudioHStageOnion';

export const KkStudioHStage = Object.assign(KkStudioHStageRoot, {
  Dot: KkStudioHStageDot,
  Onion: KkStudioHStageOnion,
  Path: KkStudioHStagePath,
});
