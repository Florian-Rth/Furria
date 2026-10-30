export interface FocusWindow {
  start: number;
  width: number;
}

export type FocusEdge = 'start' | 'end';

export const MIN_WINDOW_SECONDS = 3;
export const FIRST_WINDOW_SECONDS = 16;
export const ZOOM_FACTOR = 1.5;

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

const widthIn = (width: number, length: number): number =>
  length <= MIN_WINDOW_SECONDS
    ? Math.max(length, MIN_WINDOW_SECONDS)
    : clamp(width, MIN_WINDOW_SECONDS, length);

export const placedWindowOf = (start: number, width: number, length: number): FocusWindow => {
  const shown = widthIn(width, length);

  if (length <= shown) {
    return { start: 0, width: shown };
  }

  return {
    start: clamp(start, -shown / 2, Math.max(-shown / 2, length - shown / 2)),
    width: shown,
  };
};

export const firstWindowOf = (length: number): FocusWindow =>
  placedWindowOf(0, FIRST_WINDOW_SECONDS, length);

export const centredOn = (view: FocusWindow, seconds: number, length: number): FocusWindow =>
  placedWindowOf(seconds - view.width / 2, view.width, length);

export const keptInViewOf = (view: FocusWindow, seconds: number, length: number): FocusWindow =>
  seconds >= view.start && seconds <= view.start + view.width
    ? view
    : centredOn(view, seconds, length);

export const zoomedOf = (
  view: FocusWindow,
  factor: number,
  anchor: number,
  length: number,
): FocusWindow => {
  const width = widthIn(view.width * factor, length);
  const share = view.width <= 0 ? 0.5 : (anchor - view.start) / view.width;

  return placedWindowOf(anchor - share * width, width, length);
};

export const pannedOf = (view: FocusWindow, delta: number, length: number): FocusWindow =>
  placedWindowOf(view.start + delta, view.width, length);

export const resizedOf = (
  view: FocusWindow,
  edge: FocusEdge,
  seconds: number,
  length: number,
): FocusWindow => {
  const end = view.start + view.width;

  if (edge === 'start') {
    const start = clamp(seconds, 0, end - MIN_WINDOW_SECONDS);
    return placedWindowOf(start, end - start, length);
  }

  const stop = clamp(seconds, view.start + MIN_WINDOW_SECONDS, length);
  return placedWindowOf(view.start, stop - view.start, length);
};

export const followedStartOf = (view: FocusWindow, seconds: number): number =>
  seconds - view.width / 2;

export const trackScaleOf = (view: FocusWindow, length: number): number =>
  length <= 0 || view.width <= 0 ? 1 : length / view.width;

export const trackShiftOf = (start: number, length: number): number =>
  length <= 0 ? 0 : start / length;

export const COUNT_NUMBERS_MAX_SECONDS = 24;

export const showsEveryCount = (view: FocusWindow): boolean =>
  view.width <= COUNT_NUMBERS_MAX_SECONDS;

export const playheadShareOf = (
  view: FocusWindow,
  seconds: number,
  playing: boolean,
): number | null => {
  if (playing) {
    return 0.5;
  }
  const share = view.width <= 0 ? 0 : (seconds - view.start) / view.width;

  return share < 0 || share > 1 ? null : share;
};
