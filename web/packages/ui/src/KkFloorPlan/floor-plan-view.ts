export interface KkPlanPoint {
  x: number;
  y: number;
}

export interface KkPlanBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface KkPlanView {
  centerX: number;
  centerY: number;
  scale: number;
}

export interface KkPlanViewportSize {
  width: number;
  height: number;
}

export interface KkPlanViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface KkPlanGridSteps {
  minorCm: number;
  majorCm: number;
}

export type KkPlanResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const PLAN_ROTATE_HANDLE = 'rotate';

export const PLAN_MIN_SCALE = 0.02;
export const PLAN_MAX_SCALE = 8;
export const PLAN_FIT_PADDING_PX = 32;

const GRID_STEPS_CM: readonly number[] = [10, 50, 100, 500, 1000, 5000];
const MIN_GRID_GAP_PX = 10;
const FALLBACK_SPAN_CM = 1000;

export const DEFAULT_PLAN_VIEW: KkPlanView = { centerX: 0, centerY: 0, scale: 0.5 };

export const clampPlanScale = (scale: number): number =>
  Math.min(PLAN_MAX_SCALE, Math.max(PLAN_MIN_SCALE, scale));

export const screenToPlan = (
  view: KkPlanView,
  size: KkPlanViewportSize,
  screen: KkPlanPoint,
): KkPlanPoint => ({
  x: view.centerX + (screen.x - size.width / 2) / view.scale,
  y: view.centerY + (screen.y - size.height / 2) / view.scale,
});

export const planToScreen = (
  view: KkPlanView,
  size: KkPlanViewportSize,
  plan: KkPlanPoint,
): KkPlanPoint => ({
  x: (plan.x - view.centerX) * view.scale + size.width / 2,
  y: (plan.y - view.centerY) * view.scale + size.height / 2,
});

export const zoomPlanAbout = (
  view: KkPlanView,
  size: KkPlanViewportSize,
  screen: KkPlanPoint,
  factor: number,
): KkPlanView => {
  const scale = clampPlanScale(view.scale * factor);
  const anchor = screenToPlan(view, size, screen);

  return {
    centerX: anchor.x - (screen.x - size.width / 2) / scale,
    centerY: anchor.y - (screen.y - size.height / 2) / scale,
    scale,
  };
};

export const panPlanBy = (view: KkPlanView, deltaXPx: number, deltaYPx: number): KkPlanView => ({
  ...view,
  centerX: view.centerX - deltaXPx / view.scale,
  centerY: view.centerY - deltaYPx / view.scale,
});

export const fitPlanView = (
  bounds: KkPlanBounds,
  size: KkPlanViewportSize,
  paddingPx: number = PLAN_FIT_PADDING_PX,
): KkPlanView => {
  const spanX = Math.max(bounds.maxX - bounds.minX, 1);
  const spanY = Math.max(bounds.maxY - bounds.minY, 1);
  const roomX = Math.max(size.width - 2 * paddingPx, 1);
  const roomY = Math.max(size.height - 2 * paddingPx, 1);

  return {
    centerX: (bounds.minX + bounds.maxX) / 2,
    centerY: (bounds.minY + bounds.maxY) / 2,
    scale: clampPlanScale(Math.min(roomX / spanX, roomY / spanY)),
  };
};

export const planViewBox = (view: KkPlanView, size: KkPlanViewportSize): KkPlanViewBox => {
  const width = size.width / view.scale;
  const height = size.height / view.scale;

  return { x: view.centerX - width / 2, y: view.centerY - height / 2, width, height };
};

export const planGridSteps = (scale: number): KkPlanGridSteps => {
  const minorIndex = GRID_STEPS_CM.findIndex((step) => step * scale >= MIN_GRID_GAP_PX);
  const lastIndex = GRID_STEPS_CM.length - 1;
  const minor = minorIndex === -1 ? lastIndex : minorIndex;
  const major = Math.min(minor + 1, lastIndex);

  return {
    minorCm: GRID_STEPS_CM[minor] ?? FALLBACK_SPAN_CM,
    majorCm: GRID_STEPS_CM[major] ?? FALLBACK_SPAN_CM,
  };
};

const linesAlong = (from: number, to: number, step: number): number[] => {
  const first = Math.ceil(from / step) * step;
  const count = Math.max(0, Math.floor((to - first) / step) + 1);

  return Array.from({ length: count }, (_, index) => first + index * step);
};

export const planGridPath = (box: KkPlanViewBox, stepCm: number, skipCm: number | null): string => {
  const isSkipped = (value: number): boolean =>
    skipCm !== null && Math.abs(value / skipCm - Math.round(value / skipCm)) < 1e-6;
  const right = box.x + box.width;
  const bottom = box.y + box.height;
  const verticals = linesAlong(box.x, right, stepCm)
    .filter((x) => !isSkipped(x))
    .map((x) => `M${x} ${box.y}V${bottom}`);
  const horizontals = linesAlong(box.y, bottom, stepCm)
    .filter((y) => !isSkipped(y))
    .map((y) => `M${box.x} ${y}H${right}`);

  return [...verticals, ...horizontals].join('');
};

export const planDistance = (from: KkPlanPoint, to: KkPlanPoint): number =>
  Math.hypot(to.x - from.x, to.y - from.y);

export const planMidpoint = (from: KkPlanPoint, to: KkPlanPoint): KkPlanPoint => ({
  x: (from.x + to.x) / 2,
  y: (from.y + to.y) / 2,
});

export interface KkPlanPinch {
  view: KkPlanView;
  midpoint: KkPlanPoint;
  distance: number;
}

export const pinchPlanView = (
  start: KkPlanPinch,
  size: KkPlanViewportSize,
  midpoint: KkPlanPoint,
  distance: number,
): KkPlanView => {
  const factor = start.distance > 0 ? distance / start.distance : 1;
  const zoomed = zoomPlanAbout(start.view, size, start.midpoint, factor);

  return panPlanBy(zoomed, midpoint.x - start.midpoint.x, midpoint.y - start.midpoint.y);
};

export const WHEEL_ZOOM_RATE = 0.0015;

export const wheelZoomFactor = (deltaY: number): number => Math.exp(-deltaY * WHEEL_ZOOM_RATE);

export const boundsOfPoints = (points: readonly KkPlanPoint[]): KkPlanBounds | null => {
  if (points.length === 0) {
    return null;
  }
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
};
