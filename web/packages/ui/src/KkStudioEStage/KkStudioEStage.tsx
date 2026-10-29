import { KkStudioEStageRoot } from './internal/layout/KkStudioEStageRoot';
import { KkStudioEStageCue } from './internal/ui/KkStudioEStageCue';
import { KkStudioEStageDot } from './internal/ui/KkStudioEStageDot';
import { KkStudioEStageGhost } from './internal/ui/KkStudioEStageGhost';

export type { KkStudioEStageCueSide, KkStudioEStageCueTone } from './internal/ui/KkStudioEStageCue';
export type { KkStudioEStageDotKind } from './internal/ui/KkStudioEStageDot';
export type { KkStudioEStageGhostPoint } from './internal/ui/KkStudioEStageGhost';

export const KkStudioEStage = Object.assign(KkStudioEStageRoot, {
  Dot: KkStudioEStageDot,
  Ghost: KkStudioEStageGhost,
  Cue: KkStudioEStageCue,
});
