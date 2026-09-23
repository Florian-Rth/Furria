import { kkTokens } from '../../../../tokens';

export interface FallblattGlyph {
  char: string;
  left: number;
  width: number;
}

export interface FallblattCell {
  slot: string;
  from: string;
  to: string;
  fromCenter: number;
  toCenter: number;
  width: number;
}

export interface FallblattWindow {
  start: number;
  end: number;
}

export interface FallblattPose {
  fall: number;
  land: number;
  reveal: number;
  cover: number;
  presence: number;
  fallen: boolean;
}

export interface FallblattHeaderFold {
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
const FALL_SHARE = 0.5;
const LAND_SHARE = 0.78;
const REBOUND_DEGREES = 14;
const RIGHT_ANGLE = 90;
const PRESENCE_GAIN = 2.4;
const HEADER_TILT_DEGREES = 74;
const HEADER_HOLD_SHARE = 0.55;
const HEADER_SHRINK = 0.06;
const HEADER_FADE_EXPONENT = 2.2;

export const ramp = (value: number, from: number, to: number): number =>
  Math.min(Math.max((value - from) / (to - from), 0), 1);

export const cellOffsetAt = (cell: FallblattCell, progress: number): number =>
  cell.fromCenter + (cell.toCenter - cell.fromCenter) * progress - cell.width / 2;

const centerOf = (glyph: FallblattGlyph): number => glyph.left + glyph.width / 2;

const cellOf = (
  slot: number,
  from: FallblattGlyph | undefined,
  to: FallblattGlyph | undefined,
): FallblattCell => {
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

export const fallblattCellsOf = (
  from: readonly FallblattGlyph[],
  to: readonly FallblattGlyph[],
): FallblattCell[] =>
  Array.from({ length: Math.max(from.length, to.length) }, (_, index) =>
    cellOf(index, from[index], to[index]),
  );

export const cellWindowOf = (index: number, count: number, lead: number): FallblattWindow => {
  const span = 1 - lead;
  const duration = span / (1 + STAGGER * Math.max(count - 1, 0));
  const start = lead + index * STAGGER * duration;

  return { start, end: start + duration };
};

const landAngleAt = (settling: number): number => {
  if (settling < LAND_SHARE) {
    return RIGHT_ANGLE * (1 - (settling / LAND_SHARE) ** 2);
  }

  return REBOUND_DEGREES * Math.sin((Math.PI * (settling - LAND_SHARE)) / (1 - LAND_SHARE));
};

const cosineOf = (degrees: number): number => Math.cos((degrees * Math.PI) / 180);

export const flapPoseAt = (progress: number): FallblattPose => {
  const presence = Math.min(Math.sin(Math.PI * progress) * PRESENCE_GAIN, 1);

  if (progress < FALL_SHARE) {
    const fall = -RIGHT_ANGLE * (progress / FALL_SHARE) ** 2;

    return {
      fall,
      land: RIGHT_ANGLE,
      reveal: 1 - cosineOf(fall),
      cover: 0,
      presence,
      fallen: false,
    };
  }

  const settling = Math.min((progress - FALL_SHARE) / (1 - FALL_SHARE), 1);
  const land = landAngleAt(settling);

  return {
    fall: -RIGHT_ANGLE,
    land,
    reveal: 1,
    cover: settling < LAND_SHARE ? cosineOf(land) : 1,
    presence,
    fallen: true,
  };
};

export const headerFoldAt = (travelled: number): FallblattHeaderFold => ({
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

export const BRAND_WINDOW: FallblattWindow = { start: 0, end: BRAND_SHARE };

export const boardLeadOf = (restText: string | null): number =>
  restText === null ? BRAND_LEAD : 0;
