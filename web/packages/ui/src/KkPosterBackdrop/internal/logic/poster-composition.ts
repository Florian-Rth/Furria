export type KkPosterPhase = 'runUp' | 'opening' | 'hall' | 'hotDays' | 'ashWednesday' | 'offSeason';

export type PosterMotif =
  | 'eleven'
  | 'jesterCap'
  | 'councilCap'
  | 'order'
  | 'streamer'
  | 'candy'
  | 'confetti'
  | 'herring';

export type PosterPlate = 'red' | 'ink' | 'gold';

export type PosterView = 'phone' | 'desk';

export interface MotifPlacement {
  key: string;
  motif: PosterMotif;
  view: PosterView;
  x: number;
  y: number;
  width: number;
  cap: number;
  rotate: number;
  strength: number;
}

export type PosterInks = Record<PosterPlate, number>;

export const POSTER_PLATES: readonly PosterPlate[] = ['red', 'ink', 'gold'];

export const MOTIF_WIDTH: Record<PosterMotif, number> = {
  eleven: 240,
  jesterCap: 240,
  councilCap: 260,
  order: 160,
  streamer: 400,
  candy: 200,
  confetti: 300,
  herring: 280,
};

export const MOTIF_HEIGHT: Record<PosterMotif, number> = {
  eleven: 252,
  jesterCap: 210,
  councilCap: 150,
  order: 232,
  streamer: 150,
  candy: 110,
  confetti: 290,
  herring: 116,
};

const PHONE_WIDTH_PX = 390;
const DESK_WIDTH_PX = 1440;
const REM_PX = 16;
const PHONE_PITCH_PX = 5.5;
const DESK_PITCH_PX = 7;
const PERCENT = 100;
const EVENING_INK = 1.6;
const OPENING_INK = 1.7;
const FULL = 1;
const NONE = 0;

const renderedWidthPxOf = (placement: MotifPlacement): number =>
  placement.view === 'phone'
    ? (PHONE_WIDTH_PX * placement.width) / PERCENT
    : Math.min((DESK_WIDTH_PX * placement.width) / PERCENT, placement.cap * REM_PX);

export const screenPitchOf = (placement: MotifPlacement): number => {
  const pitchPx = placement.view === 'phone' ? PHONE_PITCH_PX : DESK_PITCH_PX;

  return (MOTIF_WIDTH[placement.motif] * pitchPx) / renderedWidthPxOf(placement);
};

export const posterInksOf = (phase: KkPosterPhase, evening: boolean): PosterInks => {
  const ink = evening ? EVENING_INK : FULL;

  if (phase === 'ashWednesday') {
    return { red: NONE, ink, gold: NONE };
  }
  if (phase === 'opening') {
    return { red: OPENING_INK, ink: ink * OPENING_INK, gold: OPENING_INK };
  }
  if (phase === 'offSeason') {
    return { red: FULL, ink, gold: evening ? FULL : NONE };
  }

  return { red: FULL, ink, gold: FULL };
};

export type ArtAnchor = 'page' | 'view';

export interface ArtPlacement extends MotifPlacement {
  anchor: ArtAnchor;
}

export type PosterTint = 'red' | 'gold' | 'ash' | 'clear';

type Spot = readonly [x: number, y: number, width: number, rotate: number];

interface Piece {
  motif: PosterMotif;
  phone: Spot | null;
  desk: Spot | null;
  cap: number;
  strength: number;
}

const RUN_UP_FLOOR = 0.55;

const piece = (
  motif: PosterMotif,
  phone: Spot | null,
  desk: Spot | null,
  cap: number,
  strength = FULL,
): Piece => ({ motif, phone, desk, cap, strength });

const RUN_UP: readonly Piece[] = [
  piece('eleven', [74, 46, 104, -6], [79, 79, 36, -5], 40),
  piece('streamer', [8, 84, 86, 66], [16, 76, 28, 6], 26, 0.85),
  piece('confetti', [88, 140, 64, 12], [42, 84, 18, 12], 18, 0.8),
  piece('streamer', [92, 196, 80, -112], [97, 22, 24, -150], 22, 0.75),
  piece('confetti', [14, 246, 62, 120], null, 18, 0.8),
];

const OPENING: readonly Piece[] = [
  piece('eleven', [72, 44, 108, -6], [76, 80, 42, -6], 46),
  piece('confetti', [18, 78, 62, 0], [10, 26, 22, 0], 20),
  piece('jesterCap', [84, 129, 70, 14], [14, 82, 20, 10], 18, 0.9),
  piece('streamer', [10, 174, 84, 70], [88, 14, 26, 170], 24, 0.85),
  piece('confetti', [86, 218, 58, 40], [44, 92, 22, 70], 20),
  piece('confetti', [16, 258, 56, 120], [96, 30, 20, 120], 18),
];

const HALL: readonly Piece[] = [
  piece('councilCap', [66, 40, 104, -8], [77, 76, 30, -6], 34),
  piece('order', [16, 95, 46, 10], [13, 80, 12, 8], 11),
  piece('streamer', [92, 146, 78, -104], [96, 24, 22, -150], 20, 0.7),
  piece('confetti', [14, 202, 60, 30], [44, 94, 16, 30], 14, 0.7),
  piece('order', [84, 246, 40, -8], null, 11, 0.85),
];

const HOT_DAYS: readonly Piece[] = [
  piece('jesterCap', [70, 42, 100, 8], [80, 84, 32, 6], 34),
  piece('streamer', [8, 84, 86, 70], [24, 70, 30, 8], 26),
  piece('candy', [88, 112, 34, 32], [60, 92, 8, 28], 7),
  piece('streamer', [94, 162, 80, -100], [94, 18, 26, -160], 24),
  piece('candy', [12, 185, 30, -24], [10, 86, 10, -24], 9),
  piece('streamer', [20, 235, 82, 70], [50, 90, 24, -12], 22, 0.85),
  piece('candy', [86, 258, 28, 64], [97, 58, 8, -12], 7),
];

const ASH_WEDNESDAY: readonly Piece[] = [
  piece('herring', [62, 40, 96, -8], [76, 86, 28, -8], 28),
  piece('herring', [26, 202, 62, 172], null, 22, 0.6),
];

const OFF_SEASON: readonly Piece[] = [
  piece('confetti', [74, 40, 84, 20], [84, 88, 18, 20], 16, 0.7),
  piece('streamer', [10, 134, 72, 76], [8, 70, 22, 16], 20, 0.6),
  piece('confetti', [88, 230, 56, 40], null, 16, 0.5),
];

const PIECES: Record<KkPosterPhase, readonly Piece[]> = {
  runUp: RUN_UP,
  opening: OPENING,
  hall: HALL,
  hotDays: HOT_DAYS,
  ashWednesday: ASH_WEDNESDAY,
  offSeason: OFF_SEASON,
};

const VIEWS: readonly PosterView[] = ['phone', 'desk'];

const anchorOf = (view: PosterView): ArtAnchor => (view === 'phone' ? 'page' : 'view');

const strengthOf = (phase: KkPosterPhase, item: Piece, runUp: number): number =>
  phase === 'runUp' && item.motif === 'eleven'
    ? item.strength * (RUN_UP_FLOOR + (FULL - RUN_UP_FLOOR) * runUp)
    : item.strength;

const placementOf = (
  phase: KkPosterPhase,
  runUp: number,
  item: Piece,
  index: number,
  view: PosterView,
): ArtPlacement | null => {
  const spot = view === 'phone' ? item.phone : item.desk;

  if (spot === null) {
    return null;
  }

  const [x, y, width, rotate] = spot;

  return {
    key: `${view}-${index}-${item.motif}`,
    motif: item.motif,
    view,
    anchor: anchorOf(view),
    x,
    y,
    width,
    cap: item.cap,
    rotate,
    strength: strengthOf(phase, item, runUp),
  };
};

export const artCompositionOf = (phase: KkPosterPhase, runUp: number): ArtPlacement[] =>
  PIECES[phase].flatMap((item, index) =>
    VIEWS.map((view) => placementOf(phase, runUp, item, index, view)).filter(
      (placement): placement is ArtPlacement => placement !== null,
    ),
  );

export const posterTintOf = (phase: KkPosterPhase, foil: boolean): PosterTint => {
  if (foil) {
    return 'gold';
  }
  if (phase === 'ashWednesday') {
    return 'ash';
  }

  return phase === 'offSeason' ? 'clear' : 'red';
};
