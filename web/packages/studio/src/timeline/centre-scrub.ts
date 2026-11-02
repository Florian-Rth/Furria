import type { HitTarget } from '../gestures/hit-priority';
import type { PanBounds } from '../gestures/pan-bounds';
import type { CountMark } from '../models/music-timeline';
import type { TimelineWindow } from './timeline-geometry';

export interface CentreZoomLimits {
  min: number;
  max: number;
}

export interface StripWindow {
  start: number;
  width: number;
}

export interface CentreSnap {
  seconds: number;
  snapped: boolean;
}

export interface CentreHandleSpot {
  key: string;
  seconds: number;
}

export const CENTRE_PX_PER_SECOND = 40;
export const CENTRE_MAX_PX_PER_SECOND = 480;
export const STRIP_PITCH = 4;
export const CENTRE_SNAP_PX = 12;
const WINDOW_REACH = 2;
const MIN_SNAP_SPACING = 4;
const HANDLE_WIDTH = 2;

export const centreOffsetOf = (seconds: number, pxPerSecond: number, centre: number): number =>
  centre - seconds * pxPerSecond;

export const centreSecondsOf = (
  offset: number,
  pxPerSecond: number,
  centre: number,
  length: number,
): number =>
  pxPerSecond > 0 ? Math.min(Math.max((centre - offset) / pxPerSecond, 0), Math.max(length, 0)) : 0;

export const secondsAtX = (
  x: number,
  offset: number,
  pxPerSecond: number,
  length: number,
): number =>
  pxPerSecond > 0 ? Math.min(Math.max((x - offset) / pxPerSecond, 0), Math.max(length, 0)) : 0;

export const centreBoundsOf = (length: number, pxPerSecond: number, centre: number): PanBounds => ({
  min: centre - length * pxPerSecond,
  max: centre,
});

export const centreZoomLimitsOf = (length: number, width: number): CentreZoomLimits => {
  const min = length > 0 && width > 0 ? width / length : 1;

  return { min, max: Math.max(min, CENTRE_MAX_PX_PER_SECOND) };
};

export const centrePxPerSecondOf = (chosen: number | null, limits: CentreZoomLimits): number =>
  Math.min(Math.max(chosen ?? CENTRE_PX_PER_SECOND, limits.min), limits.max);

export const centreScaleOf = (
  pxPerSecond: number,
  scale: number,
  limits: CentreZoomLimits,
): number =>
  pxPerSecond > 0
    ? Math.min(Math.max(pxPerSecond * scale, limits.min), limits.max) / pxPerSecond
    : 1;

const windowStepOf = (width: number): number =>
  Math.max(STRIP_PITCH, Math.ceil((width * WINDOW_REACH) / STRIP_PITCH) * STRIP_PITCH);

export const stripChunkOf = (nowPx: number, width: number): number =>
  Math.floor(Math.max(nowPx, 0) / windowStepOf(width));

export const stripWindowOf = (chunk: number, width: number, contentWidth: number): StripWindow => {
  const step = windowStepOf(width);
  const start = Math.max(0, (chunk - 1) * step);
  const end = Math.min(Math.max(contentWidth, 0), (chunk + 2) * step);

  return { start, width: Math.max(0, end - start) };
};

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

export const stripSharesOf = (strip: StripWindow, contentWidth: number): TimelineWindow =>
  contentWidth > 0
    ? { start: strip.start / contentWidth, end: (strip.start + strip.width) / contentWidth }
    : { start: 0, end: 1 };

export const stripBarCountOf = (strip: StripWindow): number =>
  Math.max(0, Math.round(strip.width / STRIP_PITCH));

export const snapCandidatesOf = (marks: readonly CountMark[], pxPerSecond: number): number[] => {
  const [first, second] = marks;
  const spacing =
    first === undefined || second === undefined
      ? 0
      : (second.seconds - first.seconds) * pxPerSecond;
  const usable = spacing >= MIN_SNAP_SPACING ? marks : marks.filter((mark) => mark.count === 1);

  return usable.map((mark) => mark.seconds);
};

export const snapSecondsOf = (
  seconds: number,
  candidates: readonly number[],
  pxPerSecond: number,
  snapPx: number = CENTRE_SNAP_PX,
): CentreSnap => {
  let best: number | null = null;
  for (const candidate of candidates) {
    const distance = Math.abs(candidate - seconds) * pxPerSecond;
    if (
      distance <= snapPx &&
      (best === null || distance < Math.abs(best - seconds) * pxPerSecond)
    ) {
      best = candidate;
    }
  }

  return best === null ? { seconds, snapped: false } : { seconds: best, snapped: true };
};

export const handleTargetsOf = (
  handles: readonly CentreHandleSpot[],
  offset: number,
  pxPerSecond: number,
  height: number,
  activeKey: string | null,
): HitTarget<string>[] =>
  handles.map((handle) => ({
    id: handle.key,
    x: offset + handle.seconds * pxPerSecond - HANDLE_WIDTH / 2,
    y: 0,
    width: HANDLE_WIDTH,
    height,
    priority: 0,
    selected: handle.key === activeKey,
  }));
