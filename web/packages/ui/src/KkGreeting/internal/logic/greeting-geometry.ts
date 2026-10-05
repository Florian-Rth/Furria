export interface GreetingRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface GreetingPoint {
  x: number;
  y: number;
}

const HALF = 0.5;
const MARK_SHARE = 0.25;

export const cellBoxOf = (
  glyph: GreetingRect,
  root: GreetingRect,
  lineHeight: number,
): GreetingRect => ({
  left: glyph.left - root.left,
  top: glyph.top - root.top + (glyph.height - lineHeight) * HALF,
  width: glyph.width,
  height: lineHeight,
});

export const burstOriginOf = (cell: GreetingRect): GreetingPoint => ({
  x: cell.left + cell.width - cell.height * MARK_SHARE,
  y: cell.top + cell.height * HALF,
});
