import { KkStudioIStageRoot } from './internal/layout/KkStudioIStageRoot';
import { KkStudioIStageCatch } from './internal/ui/KkStudioIStageCatch';
import { KkStudioIStageDot } from './internal/ui/KkStudioIStageDot';
import { KkStudioIStageLegend } from './internal/ui/KkStudioIStageLegend';
import { KkStudioIStageLive } from './internal/ui/KkStudioIStageLive';
import { KkStudioIStageOnion } from './internal/ui/KkStudioIStageOnion';
import { KkStudioIStagePaths } from './internal/ui/KkStudioIStagePaths';

export type { KkStudioIShare } from '../KkStudioIDrag/use-kk-studio-i-drag';
export type { KkStudioIStageDotKind } from './internal/ui/KkStudioIStageDot';
export type { KkStudioIStageGhost } from './internal/ui/KkStudioIStageOnion';
export type { KkStudioIStagePath, KkStudioIStagePoint } from './internal/ui/KkStudioIStagePaths';

export const KkStudioIStage = Object.assign(KkStudioIStageRoot, {
  Catch: KkStudioIStageCatch,
  Paths: KkStudioIStagePaths,
  Onion: KkStudioIStageOnion,
  Live: KkStudioIStageLive,
  Dot: KkStudioIStageDot,
  Legend: KkStudioIStageLegend,
});
