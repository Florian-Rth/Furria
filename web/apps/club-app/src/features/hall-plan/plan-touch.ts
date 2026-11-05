import type { KkPlanView, KkPlanViewportSize } from '@furria/ui/floor-plan-view';
import { PLAN_ROTATE_HANDLE, planToScreen } from '@furria/ui/floor-plan-view';
import type { Bounds } from './plan-geometry';
import type { Point } from './schemas';

export const TOUCH_MODE_MAX_WIDTH_PX = 1024;
export const SIDE_SHEET_MIN_WIDTH_PX = 900;
export const SIDE_SHEET_WIDTH_PX = 352;
export const MOUSE_HIT_TOLERANCE_PX = 8;
export const TOUCH_HIT_TOLERANCE_PX = 22;
export const TOUCH_SLOP_PX = 8;
export const LONG_PRESS_MS = 400;
export const DOUBLE_TAP_MS = 300;
export const DOUBLE_TAP_REACH_PX = 24;
export const HANDLE_LIFT_PX = 48;
export const ACTION_BUTTON_PX = 44;
export const ACTION_READOUT_PX = 40;

const ACTION_BAR_PADDING_PX = 12;
const ACTION_GAP_PX = 2;
const ACTION_BAR_HEIGHT_PX = 52;
const ACTION_BAR_GAP_PX = 32;
const KNOB_CLEARANCE_PX = 72;
const EDGE_PX = 8;
const REVEAL_MARGIN_PX = 24;
const VISIBLE_ABOVE_BOTTOM_SHEET_PERCENT = 45;
const PERCENT = 100;

export type TouchTargetKind = 'empty' | 'selected' | 'unselected' | 'handle';
export type TouchDragIntent = 'move' | 'pan';
export type LongPressIntent = 'toggle' | 'marquee';
export type ActionBarPlacement = 'above' | 'below';
export type SheetCover = 'none' | 'bottom' | 'side';

export interface TouchTarget {
  kind: TouchTargetKind;
  id: string | null;
}

export const EMPTY_TOUCH_TARGET: TouchTarget = { kind: 'empty', id: null };

export const touchTargetOf = (
  handleId: string | null,
  hitId: string | null,
  isSelected: (id: string) => boolean,
): TouchTarget => {
  if (handleId !== null) {
    return { kind: 'handle', id: null };
  }
  if (hitId === null) {
    return EMPTY_TOUCH_TARGET;
  }

  return { kind: isSelected(hitId) ? 'selected' : 'unselected', id: hitId };
};

export interface TouchTap {
  at: Point;
  time: number;
}

export interface ActionBarAnchor {
  x: number;
  y: number;
  placement: ActionBarPlacement;
}

export const isTouchPlanMode = (coarsePointer: boolean, widthPx: number): boolean =>
  coarsePointer || widthPx < TOUCH_MODE_MAX_WIDTH_PX;

export const hasSideSheet = (widthPx: number): boolean => widthPx >= SIDE_SHEET_MIN_WIDTH_PX;

export const hitTolerancePxOf = (touch: boolean): number =>
  touch ? TOUCH_HIT_TOLERANCE_PX : MOUSE_HIT_TOLERANCE_PX;

export const isBeyondSlop = (from: Point, to: Point): boolean =>
  Math.hypot(to.x - from.x, to.y - from.y) > TOUCH_SLOP_PX;

export const dragIntentOf = (target: TouchTargetKind): TouchDragIntent =>
  target === 'selected' || target === 'handle' ? 'move' : 'pan';

export const longPressIntentOf = (target: TouchTargetKind): LongPressIntent | null => {
  switch (target) {
    case 'empty':
      return 'marquee';
    case 'selected':
    case 'unselected':
      return 'toggle';
    case 'handle':
      return null;
  }
};

export const isDoubleTap = (previous: TouchTap | null, tap: TouchTap): boolean =>
  previous !== null &&
  tap.time - previous.time <= DOUBLE_TAP_MS &&
  Math.hypot(tap.at.x - previous.at.x, tap.at.y - previous.at.y) <= DOUBLE_TAP_REACH_PX;

export const isLiftableHandle = (handleId: string | null): boolean =>
  handleId !== null && handleId !== PLAN_ROTATE_HANDLE;

export const liftedPoint = (at: Point, scale: number): Point => ({
  x: at.x,
  y: at.y - HANDLE_LIFT_PX / scale,
});

export const screenRectOf = (
  bounds: Bounds,
  view: KkPlanView,
  size: KkPlanViewportSize,
): Bounds => {
  const topLeft = planToScreen(view, size, { x: bounds.minX, y: bounds.minY });
  const bottomRight = planToScreen(view, size, { x: bounds.maxX, y: bounds.maxY });

  return { minX: topLeft.x, minY: topLeft.y, maxX: bottomRight.x, maxY: bottomRight.y };
};

export const actionBarWidthOf = (buttons: number, readouts: number): number =>
  buttons * ACTION_BUTTON_PX +
  readouts * ACTION_READOUT_PX +
  (buttons + readouts) * ACTION_GAP_PX +
  ACTION_BAR_PADDING_PX;

const clamp = (value: number, low: number, high: number): number =>
  high < low ? (low + high) / 2 : Math.min(Math.max(value, low), high);

export const actionBarAnchorOf = (
  rect: Bounds,
  size: KkPlanViewportSize,
  barWidthPx: number,
): ActionBarAnchor => {
  const half = Math.min(barWidthPx, size.width - 2 * EDGE_PX) / 2;
  const x = clamp((rect.minX + rect.maxX) / 2, EDGE_PX + half, size.width - EDGE_PX - half);
  const above = rect.minY - ACTION_BAR_GAP_PX;
  if (above - ACTION_BAR_HEIGHT_PX >= EDGE_PX) {
    return { x, y: Math.min(above, size.height - EDGE_PX), placement: 'above' };
  }
  const below = rect.maxY + KNOB_CLEARANCE_PX;

  return {
    x,
    y: clamp(below, EDGE_PX, size.height - EDGE_PX - ACTION_BAR_HEIGHT_PX),
    placement: 'below',
  };
};

export const visibleRectOf = (size: KkPlanViewportSize, cover: SheetCover): Bounds => {
  switch (cover) {
    case 'none':
      return { minX: 0, minY: 0, maxX: size.width, maxY: size.height };
    case 'bottom':
      return {
        minX: 0,
        minY: 0,
        maxX: size.width,
        maxY: (size.height * VISIBLE_ABOVE_BOTTOM_SHEET_PERCENT) / PERCENT,
      };
    case 'side':
      return { minX: 0, minY: 0, maxX: size.width - SIDE_SHEET_WIDTH_PX, maxY: size.height };
  }
};

const revealAlong = (
  low: number,
  high: number,
  visibleLow: number,
  visibleHigh: number,
): number => {
  const start = visibleLow + REVEAL_MARGIN_PX;
  const end = visibleHigh - REVEAL_MARGIN_PX;
  if (high - low > end - start || low < start) {
    return start - low;
  }

  return high > end ? end - high : 0;
};

export const revealPanOf = (rect: Bounds, visible: Bounds): Point => ({
  x: revealAlong(rect.minX, rect.maxX, visible.minX, visible.maxX),
  y: revealAlong(rect.minY, rect.maxY, visible.minY, visible.maxY),
});
