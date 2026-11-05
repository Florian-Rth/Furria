import { KkFloorPlanRoot } from './internal/layout/KkFloorPlanRoot';
import { KkFloorPlanArea } from './internal/ui/KkFloorPlanArea';
import { KkFloorPlanAreaOutline } from './internal/ui/KkFloorPlanAreaOutline';
import { KkFloorPlanChair } from './internal/ui/KkFloorPlanChair';
import { KkFloorPlanChairCell } from './internal/ui/KkFloorPlanChairCell';
import { KkFloorPlanChairZone } from './internal/ui/KkFloorPlanChairZone';
import { KkFloorPlanDoor } from './internal/ui/KkFloorPlanDoor';
import { KkFloorPlanEdgeLength } from './internal/ui/KkFloorPlanEdgeLength';
import { KkFloorPlanFinding } from './internal/ui/KkFloorPlanFinding';
import { KkFloorPlanGhost } from './internal/ui/KkFloorPlanGhost';
import { KkFloorPlanGuide } from './internal/ui/KkFloorPlanGuide';
import { KkFloorPlanHandle } from './internal/ui/KkFloorPlanHandle';
import { KkFloorPlanLabel } from './internal/ui/KkFloorPlanLabel';
import { KkFloorPlanLoupe } from './internal/ui/KkFloorPlanLoupe';
import { KkFloorPlanMarkLine } from './internal/ui/KkFloorPlanMarkLine';
import { KkFloorPlanMarquee } from './internal/ui/KkFloorPlanMarquee';
import { KkFloorPlanMeasure } from './internal/ui/KkFloorPlanMeasure';
import { KkFloorPlanNoteMark } from './internal/ui/KkFloorPlanNoteMark';
import { KkFloorPlanPillar } from './internal/ui/KkFloorPlanPillar';
import { KkFloorPlanSelection } from './internal/ui/KkFloorPlanSelection';
import { KkFloorPlanTable } from './internal/ui/KkFloorPlanTable';
import { KkFloorPlanWall } from './internal/ui/KkFloorPlanWall';

export type {
  KkPlanAreaKind,
  KkPlanDoorKind,
  KkPlanSeverity,
  KkPlanSides,
  KkPlanTableShape,
} from './internal/floor-plan-paint';
export type { KkPlanCursor } from './internal/layout/KkFloorPlanRoot';
export type {
  KkFloorPlanHandle,
  KkPlanPointerEvent,
} from './internal/logic/use-floor-plan-viewport';
export type { KkPlanHandleShape } from './internal/ui/KkFloorPlanHandle';
export type { KkPlanLabelSize } from './internal/ui/KkFloorPlanLabel';

export const KkFloorPlan = Object.assign(KkFloorPlanRoot, {
  Wall: KkFloorPlanWall,
  Door: KkFloorPlanDoor,
  Area: KkFloorPlanArea,
  AreaOutline: KkFloorPlanAreaOutline,
  EdgeLength: KkFloorPlanEdgeLength,
  Pillar: KkFloorPlanPillar,
  MarkLine: KkFloorPlanMarkLine,
  Label: KkFloorPlanLabel,
  Table: KkFloorPlanTable,
  ChairZone: KkFloorPlanChairZone,
  ChairCell: KkFloorPlanChairCell,
  Chair: KkFloorPlanChair,
  NoteMark: KkFloorPlanNoteMark,
  Finding: KkFloorPlanFinding,
  Measure: KkFloorPlanMeasure,
  Selection: KkFloorPlanSelection,
  Handle: KkFloorPlanHandle,
  Guide: KkFloorPlanGuide,
  Marquee: KkFloorPlanMarquee,
  Ghost: KkFloorPlanGhost,
  Loupe: KkFloorPlanLoupe,
});
