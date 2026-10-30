import { KkStudioGStageRoot } from './internal/layout/KkStudioGStageRoot';
import { KkStudioGStageDot } from './internal/ui/KkStudioGStageDot';
import { KkStudioGStageMarquee } from './internal/ui/KkStudioGStageMarquee';
import { KkStudioGStageTrail } from './internal/ui/KkStudioGStageTrail';

export type { KkStudioGStageViewpoint } from './internal/layout/KkStudioGStageRoot';
export type {
  KkStudioGStageGestures,
  KkStudioGStageShareBox,
} from './internal/logic/use-stage-pointer';
export type { KkStudioGStageDotKind } from './internal/ui/KkStudioGStageDot';
export type { KkStudioGStagePoint } from './internal/ui/KkStudioGStageTrail';

export const KkStudioGStage = Object.assign(KkStudioGStageRoot, {
  Dot: KkStudioGStageDot,
  Trail: KkStudioGStageTrail,
  Marquee: KkStudioGStageMarquee,
});
