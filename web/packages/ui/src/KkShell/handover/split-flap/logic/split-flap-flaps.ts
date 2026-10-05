import { ramp } from '../../../../internal/flap/flap-pose';
import { kkTokens } from '../../../../tokens';

export interface SplitFlapGlyph {
  char: string;
  left: number;
  width: number;
}

export interface SplitFlapCell {
  slot: string;
  from: string;
  to: string;
  fromCenter: number;
  toCenter: number;
  width: number;
}

export interface SplitFlapWindow {
  start: number;
  end: number;
}

export interface SplitFlapHeaderFold {
  tilt: number;
  hold: number;
  scale: number;
  opacity: number;
}

const BLANK = '';
const { scrollTravel } = kkTokens.shell;
const BOARD_START = scrollTravel * 0.12;
const BOARD_END = scrollTravel * 1.3;
const HEADER_END = scrollTravel * 0.9;
const BRAND_SHARE = 0.46;
const BRAND_LEAD = 0.28;
const STAGGER = 0.14;
const HEADER_TILT_DEGREES = 74;
const HEADER_HOLD_SHARE = 0.55;
const HEADER_SHRINK = 0.06;
const HEADER_FADE_EXPONENT = 2.2;

export const cellOffsetAt = (cell: SplitFlapCell, progress: number): number =>
  cell.fromCenter + (cell.toCenter - cell.fromCenter) * progress - cell.width / 2;

const centerOf = (glyph: SplitFlapGlyph): number => glyph.left + glyph.width / 2;

const cellOf = (
  slot: number,
  from: SplitFlapGlyph | undefined,
  to: SplitFlapGlyph | undefined,
): SplitFlapCell => {
  const fromCenter = from === undefined ? 0 : centerOf(from);
  const toCenter = to === undefined ? fromCenter : centerOf(to);

  return {
    slot: String(slot),
    from: from?.char ?? BLANK,
    to: to?.char ?? BLANK,
    fromCenter: from === undefined ? toCenter : fromCenter,
    toCenter,
    width: Math.max(from?.width ?? 0, to?.width ?? 0),
  };
};

export const splitFlapCellsOf = (
  from: readonly SplitFlapGlyph[],
  to: readonly SplitFlapGlyph[],
): SplitFlapCell[] =>
  Array.from({ length: Math.max(from.length, to.length) }, (_, index) =>
    cellOf(index, from[index], to[index]),
  );

export const cellWindowOf = (index: number, count: number, lead: number): SplitFlapWindow => {
  const span = 1 - lead;
  const duration = span / (1 + STAGGER * Math.max(count - 1, 0));
  const start = lead + index * STAGGER * duration;

  return { start, end: start + duration };
};

export const headerFoldAt = (travelled: number): SplitFlapHeaderFold => ({
  tilt: HEADER_TILT_DEGREES * travelled,
  hold: HEADER_HOLD_SHARE * HEADER_END * travelled,
  scale: 1 - HEADER_SHRINK * travelled,
  opacity: 1 - travelled ** HEADER_FADE_EXPONENT,
});

const snapped = (offset: number): number => (offset > 0 ? 1 : 0);

export const boardProgressAt = (offset: number, reduced: boolean): number =>
  reduced ? snapped(offset) : ramp(offset, BOARD_START, BOARD_END);

export const headerTravelAt = (offset: number, reduced: boolean): number =>
  reduced ? snapped(offset) : ramp(offset, 0, HEADER_END);

export const BRAND_WINDOW: SplitFlapWindow = { start: 0, end: BRAND_SHARE };

export const boardLeadOf = (restText: string | null): number =>
  restText === null ? BRAND_LEAD : 0;
