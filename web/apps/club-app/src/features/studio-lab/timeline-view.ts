import type { PanBounds } from '@furria/studio/pan-bounds';

export interface TimelineView {
  pxPerSecond: number;
  offsetPx: number;
}

export interface ZoomLimits {
  min: number;
  max: number;
}

export interface SnapResult {
  seconds: number;
  snapped: boolean;
}

export const MAX_PX_PER_SECOND = 480;
export const SNAP_PX = 12;

export const xOfSeconds = (seconds: number, view: TimelineView): number =>
  seconds * view.pxPerSecond + view.offsetPx;

export const secondsOfX = (x: number, view: TimelineView): number =>
  (x - view.offsetPx) / view.pxPerSecond;

export const zoomLimitsOf = (length: number, width: number): ZoomLimits => {
  const min = length > 0 && width > 0 ? width / length : 1;

  return { min, max: Math.max(min, MAX_PX_PER_SECOND) };
};

export const fitView = (length: number, width: number): TimelineView => ({
  pxPerSecond: zoomLimitsOf(length, width).min,
  offsetPx: 0,
});

export const panBoundsOf = (view: TimelineView, length: number, width: number): PanBounds => ({
  min: Math.min(0, width - length * view.pxPerSecond),
  max: 0,
});

export const zoomedView = (
  view: TimelineView,
  scale: number,
  focalX: number,
  limits: ZoomLimits,
): TimelineView => {
  const pxPerSecond = Math.min(Math.max(view.pxPerSecond * scale, limits.min), limits.max);
  const focalSeconds = secondsOfX(focalX, view);

  return { pxPerSecond, offsetPx: focalX - focalSeconds * pxPerSecond };
};

export const snapSecondsOf = (
  seconds: number,
  candidates: readonly number[],
  view: TimelineView,
  snapPx: number = SNAP_PX,
): SnapResult => {
  let best: number | null = null;
  for (const candidate of candidates) {
    const distance = Math.abs(candidate - seconds) * view.pxPerSecond;
    if (
      distance <= snapPx &&
      (best === null || distance < Math.abs(best - seconds) * view.pxPerSecond)
    ) {
      best = candidate;
    }
  }

  return best === null ? { seconds, snapped: false } : { seconds: best, snapped: true };
};

export const followViewToSeconds = (
  view: TimelineView,
  seconds: number,
  width: number,
  margin: number,
): TimelineView => {
  const x = xOfSeconds(seconds, view);
  if (x >= margin && x <= width - margin) {
    return view;
  }

  return { ...view, offsetPx: margin - seconds * view.pxPerSecond };
};
