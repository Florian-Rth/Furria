import { KkPlanTouchCanvas } from './internal/layout/KkPlanTouchCanvas';
import { KkPlanTouchDock } from './internal/layout/KkPlanTouchDock';
import { KkPlanTouchFloat } from './internal/layout/KkPlanTouchFloat';
import { KkPlanTouchRoot } from './internal/layout/KkPlanTouchRoot';
import { KkPlanTouchSheet } from './internal/layout/KkPlanTouchSheet';
import { KkPlanTouchTop } from './internal/layout/KkPlanTouchTop';
import { KkPlanTouchTray } from './internal/layout/KkPlanTouchTray';

export type { KkPlanFloatPlacement } from './internal/layout/KkPlanTouchFloat';

export const KkPlanTouch = Object.assign(KkPlanTouchRoot, {
  Top: KkPlanTouchTop,
  Canvas: KkPlanTouchCanvas,
  Float: KkPlanTouchFloat,
  Tray: KkPlanTouchTray,
  Dock: KkPlanTouchDock,
  Sheet: KkPlanTouchSheet,
});
