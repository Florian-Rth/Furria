export interface DeskWindow {
  start: number;
  end: number;
}

export interface DeskFrame {
  perSecond: number;
  centre: number;
}

export type DeskWindowSide = 'start' | 'end';

const MIN_WINDOW_SECONDS = 1;
const PAN_SHARE = 0.25;

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

export const windowOf = (left: number, perSecond: number, visible: number): DeskWindow => {
  if (perSecond <= 0) {
    return { start: 0, end: 0 };
  }
  const centre = left / perSecond;
  const half = visible / 2 / perSecond;

  return { start: centre - half, end: centre + half };
};

export const windowSharesOf = (window: DeskWindow, length: number): DeskWindow =>
  length <= 0
    ? { start: 0, end: 0 }
    : {
        start: clamp(window.start / length, 0, 1),
        end: clamp(window.end / length, 0, 1),
      };

export const resizedFrameOf = (
  window: DeskWindow,
  side: DeskWindowSide,
  seconds: number,
  length: number,
  visible: number,
): DeskFrame => {
  const shownStart = Math.max(0, window.start);
  const shownEnd = Math.min(length, window.end);
  const start = side === 'start' ? clamp(seconds, 0, shownEnd - MIN_WINDOW_SECONDS) : shownStart;
  const end = side === 'end' ? clamp(seconds, shownStart + MIN_WINDOW_SECONDS, length) : shownEnd;
  const width = Math.max(MIN_WINDOW_SECONDS, end - start);

  return { perSecond: visible / width, centre: (start + end) / 2 };
};

export const pannedCentreOf = (window: DeskWindow, direction: 1 | -1, length: number): number =>
  clamp(
    (window.start + window.end) / 2 + direction * (window.end - window.start) * PAN_SHARE,
    0,
    length,
  );
