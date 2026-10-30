const BASE_FONT_PX = 16;
const LARGE_TEXT_SCALE = 1.5;
const NARROW_VIEWPORT_PX = 360;

export const isLargeText = (rootFontPx: number, viewportWidthPx: number): boolean =>
  rootFontPx / BASE_FONT_PX >= LARGE_TEXT_SCALE || viewportWidthPx < NARROW_VIEWPORT_PX;
