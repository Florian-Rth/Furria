import { KkStudioStageRoot } from './internal/layout/KkStudioStageRoot';
import { KkStudioStageDot } from './internal/ui/KkStudioStageDot';
import { KkStudioStageHandle } from './internal/ui/KkStudioStageHandle';
import { KkStudioStageOnion } from './internal/ui/KkStudioStageOnion';
import { KkStudioStagePath } from './internal/ui/KkStudioStagePath';

export type { KkStudioStageDotKind } from './internal/ui/KkStudioStageDot';
export type { KkStudioStagePoint } from './internal/ui/KkStudioStageOnion';

export const KkStudioStage = Object.assign(KkStudioStageRoot, {
  Dot: KkStudioStageDot,
  Handle: KkStudioStageHandle,
  Onion: KkStudioStageOnion,
  Path: KkStudioStagePath,
});
