import type { PanBounds } from '@furria/studio/pan-bounds';
import type { InertiaOptions } from 'motion/react';
import { BAR_PITCH } from './timeline-layers';
import type { TimelineView, ZoomLimits } from './timeline-view';

export interface StripWindow {
  start: number;
  width: number;
}

export const CENTRE_PX_PER_SECOND = 40;
const WINDOW_REACH = 2;

export const centreOffsetOf = (seconds: number, pxPerSecond: number, centre: number): number =>
  centre - seconds * pxPerSecond;

export const centreSecondsOf = (
  offset: number,
  pxPerSecond: number,
  centre: number,
  length: number,
): number =>
  pxPerSecond > 0 ? Math.min(Math.max((centre - offset) / pxPerSecond, 0), Math.max(length, 0)) : 0;

export const centreBoundsOf = (length: number, pxPerSecond: number, centre: number): PanBounds => ({
  min: centre - length * pxPerSecond,
  max: centre,
});

export const momentumTargetOf = (from: number, momentum: InertiaOptions): number =>
  from + (momentum.power ?? 0) * (momentum.velocity ?? 0);

export const centrePxPerSecondOf = (chosen: number | null, limits: ZoomLimits): number =>
  Math.min(Math.max(chosen ?? CENTRE_PX_PER_SECOND, limits.min), limits.max);

export const centreScaleOf = (pxPerSecond: number, scale: number, limits: ZoomLimits): number =>
  pxPerSecond > 0
    ? Math.min(Math.max(pxPerSecond * scale, limits.min), limits.max) / pxPerSecond
    : 1;

const windowStepOf = (width: number): number =>
  Math.max(BAR_PITCH, Math.ceil((width * WINDOW_REACH) / BAR_PITCH) * BAR_PITCH);

export const stripChunkOf = (nowPx: number, width: number): number =>
  Math.floor(Math.max(nowPx, 0) / windowStepOf(width));

export const stripWindowOf = (chunk: number, width: number, contentWidth: number): StripWindow => {
  const step = windowStepOf(width);
  const start = Math.max(0, (chunk - 1) * step);
  const end = Math.min(Math.max(contentWidth, 0), (chunk + 2) * step);

  return { start, width: Math.max(0, end - start) };
};

export const stripViewOf = (strip: StripWindow, pxPerSecond: number): TimelineView => ({
  pxPerSecond,
  offsetPx: -strip.start,
});

export const stripOutrunOf = (
  strip: StripWindow,
  nowPx: number,
  width: number,
  contentWidth: number,
): boolean => {
  const end = strip.start + strip.width;
  const lowOut = strip.start > 0 && nowPx < strip.start + width;
  const highOut = end < contentWidth && nowPx > end - width;

  return lowOut || highOut || nowPx < strip.start || nowPx > end;
};
