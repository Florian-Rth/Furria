import { KkStageInkBar } from './internal/ui/KkStageInkBar';
import { KkStageInkCount } from './internal/ui/KkStageInkCount';
import { KkStageInkCue } from './internal/ui/KkStageInkCue';
import { KkStageInkDisc } from './internal/ui/KkStageInkDisc';
import { KkStageInkEcho } from './internal/ui/KkStageInkEcho';
import { KkStageInkFront } from './internal/ui/KkStageInkFront';
import { KkStageInkGrid } from './internal/ui/KkStageInkGrid';
import { KkStageInkHandle } from './internal/ui/KkStageInkHandle';
import { KkStageInkKey } from './internal/ui/KkStageInkKey';
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
  KkStageInkGridLine,
} from './stage-ink-density';

export const KkStageInk = Object.assign(KkStageInkPlane, {
  Bar: KkStageInkBar,
  Count: KkStageInkCount,
  Cue: KkStageInkCue,
  Disc: KkStageInkDisc,
  Echo: KkStageInkEcho,
  Front: KkStageInkFront,
  Grid: KkStageInkGrid,
  Handle: KkStageInkHandle,
  Key: KkStageInkKey,
  Line: KkStageInkLine,
  Name: KkStageInkName,
  Ring: KkStageInkRing,
});
