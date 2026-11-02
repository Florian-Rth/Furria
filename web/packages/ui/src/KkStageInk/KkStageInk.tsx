import { KkStageInkCount } from './internal/ui/KkStageInkCount';
import { KkStageInkCue } from './internal/ui/KkStageInkCue';
import { KkStageInkDisc } from './internal/ui/KkStageInkDisc';
import { KkStageInkFront } from './internal/ui/KkStageInkFront';
import { KkStageInkLine } from './internal/ui/KkStageInkLine';
import { KkStageInkName } from './internal/ui/KkStageInkName';
import { KkStageInkPlane } from './internal/ui/KkStageInkPlane';
import { KkStageInkRing } from './internal/ui/KkStageInkRing';

export type { KkStageInkCueSide, KkStageInkCueTone } from './internal/ui/KkStageInkCue';
export type { KkStageInkLineKind, KkStageInkPoint } from './internal/ui/KkStageInkLine';
export type {
  KkStageInkDensity,
  KkStageInkDiscKind,
  KkStageInkFrontEdge,
} from './stage-ink-density';

export const KkStageInk = Object.assign(KkStageInkPlane, {
  Count: KkStageInkCount,
  Cue: KkStageInkCue,
  Disc: KkStageInkDisc,
  Front: KkStageInkFront,
  Line: KkStageInkLine,
  Name: KkStageInkName,
  Ring: KkStageInkRing,
});
