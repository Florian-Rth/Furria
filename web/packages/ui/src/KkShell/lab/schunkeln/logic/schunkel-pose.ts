export interface SchunkelGlyph {
  char: string;
  left: number;
  top: number;
  width: number;
  height: number;
  line: number;
}

export interface SchunkelPoint {
  left: number;
  top: number;
}

export interface SchunkelLetterPlan {
  upper: string | null;
  lower: string | null;
  homeLeft: number;
  homeTop: number;
  dockLeft: number;
  dockTop: number;
  width: number;
  height: number;
}

export interface SchunkelPlan {
  letters: SchunkelLetterPlan[];
  dockScale: number;
}

export interface SchunkelLetterPose {
  x: number;
  y: number;
  scale: number;
  presence: number;
}

export interface SchunkelRestPose {
  x: number;
  opacity: number;
}

export const LETTER_ORIGIN_X = 0.5;
export const LETTER_ORIGIN_Y = 0.8;

const STAGGER_SPAN = 0.16;
const STAGGER_STEP = 0.025;
const CASE_TURN = 0.45;
const GLIDE_MOMENTUM = 0.4;
const FADE_OUT_FROM = 0.15;
const FADE_OUT_TO = 0.55;
const FADE_IN_FROM = 0.45;
const FADE_IN_TO = 0.85;
const REST_SHARE = 0.5;
const REST_STAGGER = 0.35;
const REST_SHIFT = -18;
const HEADER_SHARE = 0.5;

const lerp = (from: number, to: number, amount: number): number => from + (to - from) * amount;

export const ramp = (value: number, from: number, to: number): number =>
  Math.min(Math.max((value - from) / (to - from), 0), 1);

const glideOf = (progress: number): number =>
  GLIDE_MOMENTUM * progress + (1 - GLIDE_MOMENTUM) * (1 - (1 - progress) ** 2);

const liftOf = (progress: number): number => progress * progress;

const isBlank = (char: string | null): boolean => char === null || char.trim().length === 0;

export const handoverProgressAt = (scrollOffset: number, travel: number): number =>
  Math.min(Math.max(scrollOffset / travel, 0), 1);

export const headerLeaveAt = (progress: number): number => ramp(progress, 0, HEADER_SHARE);

export const letterProgressAt = (progress: number, index: number, count: number): number => {
  const step = count > 1 ? Math.min(STAGGER_SPAN / (count - 1), STAGGER_STEP) : 0;
  const lead = index * step;
  const span = 1 - (count - 1) * step;

  return ramp(progress, lead, lead + span);
};

export const lowerDueAt = (progress: number): boolean => progress >= CASE_TURN;

export const swapsCase = (letter: SchunkelLetterPlan): boolean =>
  letter.upper !== null && letter.lower !== null;

export const lowerMixOf = (letter: SchunkelLetterPlan, lowered: boolean): number => {
  if (letter.upper === null) {
    return 1;
  }

  if (letter.lower === null) {
    return 0;
  }

  return lowered ? 1 : 0;
};

const presenceOf = (letter: SchunkelLetterPlan, progress: number): number => {
  if (letter.lower === null) {
    return 1 - ramp(progress, FADE_OUT_FROM, FADE_OUT_TO);
  }

  if (letter.upper === null) {
    return ramp(progress, FADE_IN_FROM, FADE_IN_TO);
  }

  return 1;
};

export const letterPoseAt = (
  letter: SchunkelLetterPlan,
  index: number,
  count: number,
  progress: number,
  scrollOffset: number,
  dockScale: number,
): SchunkelLetterPose => {
  const own = letterProgressAt(progress, index, count);
  const glide = glideOf(own);
  const scale = lerp(1, dockScale, glide);
  const left = lerp(letter.homeLeft, letter.dockLeft, glide);
  const top = lerp(letter.homeTop - scrollOffset, letter.dockTop, liftOf(own));

  return {
    x: left - LETTER_ORIGIN_X * letter.width * (1 - scale),
    y: top - LETTER_ORIGIN_Y * letter.height * (1 - scale),
    scale,
    presence: presenceOf(letter, own),
  };
};

export const restPoseAt = (progress: number, index: number, count: number): SchunkelRestPose => {
  const leaving = ramp(progress, 0, REST_SHARE);
  const lead = count > 1 ? (index / (count - 1)) * REST_STAGGER : 0;
  const own = ramp(leaving, lead, lead + 1 - REST_STAGGER);

  return { x: REST_SHIFT * own * own, opacity: 1 - own };
};

const firstLineOf = (glyphs: readonly SchunkelGlyph[]): SchunkelGlyph[] =>
  glyphs.filter((glyph) => glyph.line === 0);

export const schunkelPlanOf = (
  headline: readonly SchunkelGlyph[],
  headlineOrigin: SchunkelPoint,
  title: readonly SchunkelGlyph[],
  slotOrigin: SchunkelPoint,
  dockScale: number,
): SchunkelPlan => {
  const docked = firstLineOf(title);
  const count = Math.max(headline.length, docked.length);
  const letters: SchunkelLetterPlan[] = [];

  for (let index = 0; index < count; index += 1) {
    const home = headline.at(index) ?? null;
    const dock = docked.at(index) ?? null;
    const upper = home === null || isBlank(home.char) ? null : home.char;
    const lower = dock === null || isBlank(dock.char) ? null : dock.char;

    if (upper === null && lower === null) {
      continue;
    }

    const width = home?.width ?? (dock?.width ?? 0) / dockScale;
    const height = home?.height ?? (dock?.height ?? 0) / dockScale;
    const homeLeft = home?.left ?? (dock?.left ?? 0) / dockScale;
    const homeTop = home?.top ?? (dock?.top ?? 0) / dockScale;
    const dockLeft = dock?.left ?? homeLeft * dockScale;
    const dockTop = dock?.top ?? homeTop * dockScale;

    letters.push({
      upper,
      lower,
      homeLeft: headlineOrigin.left + homeLeft,
      homeTop: headlineOrigin.top + homeTop,
      dockLeft: slotOrigin.left + dockLeft,
      dockTop: slotOrigin.top + dockTop,
      width,
      height,
    });
  }

  return { letters, dockScale };
};
