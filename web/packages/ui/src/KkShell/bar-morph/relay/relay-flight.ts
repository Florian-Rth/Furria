export interface RelayPoint {
  x: number;
  y: number;
}

export interface RelayAnchor extends RelayPoint {
  glyph: number;
}

export interface RelayTextFlight {
  from: RelayAnchor;
  to: RelayAnchor;
  control: RelayPoint;
}

export type RelayArc = 'swoop' | 'toss';

export interface RelayTextSpot extends RelayPoint {
  glyph: number;
}

export interface RelayOffset {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
}

export interface RelayHandover {
  source: number;
  target: number;
}

export interface RelayEcho {
  progress: number;
  opacity: number;
}

export interface RelayGlow {
  scale: number;
  opacity: number;
}

const HOP_DISTANCE = 48;
const HOP_LIFT = 18;
const SWOOP_RATIO = 0.26;
const SWOOP_LIMIT = 72;
const SWOOP_RISE = 0.8;
const TOSS_DRIFT = 0.35;
const TOSS_FALL = 0.45;
const FIT_MARGIN = 16;
const LAUNCH = 0.04;
const CROUCH_DIP = 4;
const CROUCH_SHRINK = 0.04;
const TRAVEL_END = 0.85;
const TRAVEL_OVERSHOOT = 0.06;
const OVERSHOOT_START = 0.65;
const GROWTH_END = 0.8;
const ECHO_LAG = 0.035;
const ECHO_PEAK = 0.26;
const GLOW_START = 0.82;
const GLOW_PEAK = 0.45;
const GLOW_SWELL = 0.1;

export const NEUTRAL_OFFSET: RelayOffset = { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };

export const spanOf = (progress: number, start: number, end: number): number =>
  Math.min(1, Math.max(0, (progress - start) / (end - start)));

export const lerp = (from: number, to: number, amount: number): number =>
  from + (to - from) * amount;

export const easeOutCubic = (amount: number): number => 1 - (1 - amount) ** 3;

export const easeOutQuart = (amount: number): number => 1 - (1 - amount) ** 4;

export const easeInCubic = (amount: number): number => amount ** 3;

export const travelOf = (progress: number): number => {
  const glide = easeOutQuart(spanOf(progress, LAUNCH, TRAVEL_END));
  const overshoot = Math.sin(Math.PI * spanOf(progress, OVERSHOOT_START, 1)) * TRAVEL_OVERSHOOT;

  return glide + overshoot;
};

export const backOut = (amount: number, overshoot: number): number =>
  1 + (overshoot + 1) * (amount - 1) ** 3 + overshoot * (amount - 1) ** 2;

export const bezierAt = (
  from: RelayPoint,
  control: RelayPoint,
  to: RelayPoint,
  amount: number,
): RelayPoint => {
  const rest = 1 - amount;

  return {
    x: rest * rest * from.x + 2 * rest * amount * control.x + amount * amount * to.x,
    y: rest * rest * from.y + 2 * rest * amount * control.y + amount * amount * to.y,
  };
};

export const controlOf = (from: RelayPoint, to: RelayPoint, arc: RelayArc): RelayPoint => {
  const middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const distance = Math.hypot(to.x - from.x, to.y - from.y);

  if (distance < HOP_DISTANCE) {
    return { x: middle.x, y: Math.min(from.y, to.y) - HOP_LIFT };
  }

  if (arc === 'toss') {
    return { x: lerp(from.x, to.x, TOSS_DRIFT), y: lerp(from.y, to.y, TOSS_FALL) };
  }

  const bow = Math.min(SWOOP_LIMIT, distance * SWOOP_RATIO);

  return {
    x: middle.x + (Math.abs(to.y - from.y) / distance) * bow,
    y: lerp(from.y, to.y, SWOOP_RISE),
  };
};

export const textSpotAt = (flight: RelayTextFlight, progress: number): RelayTextSpot => {
  const crouch = Math.sin(Math.PI * spanOf(progress, 0, LAUNCH));
  const travel = travelOf(progress);
  const point = bezierAt(flight.from, flight.control, flight.to, travel);
  const growth = easeOutQuart(spanOf(progress, LAUNCH, GROWTH_END));
  const glyph = lerp(flight.from.glyph, flight.to.glyph, growth);

  return {
    x: point.x,
    y: point.y + crouch * CROUCH_DIP,
    glyph: glyph * (1 - crouch * CROUCH_SHRINK),
  };
};

export const textHandoverAt = (progress: number): RelayHandover => ({
  source: 1 - spanOf(progress, 0.3, 0.56),
  target: spanOf(progress, 0.3, 0.58),
});

export const echoAt = (progress: number, index: number): RelayEcho => {
  const lagged = progress - (index + 1) * ECHO_LAG;

  if (lagged <= 0) {
    return { progress: 0, opacity: 0 };
  }

  const swell = Math.sin(Math.PI * spanOf(progress, 0.04, 0.56));

  return { progress: lagged, opacity: (ECHO_PEAK / (index + 1)) * swell };
};

export const landingGlowAt = (progress: number): RelayGlow => {
  const landed = spanOf(progress, GLOW_START, 1);

  if (landed <= 0) {
    return { scale: 1, opacity: 0 };
  }

  return { scale: 1 + GLOW_SWELL * easeOutCubic(landed), opacity: GLOW_PEAK * (1 - landed) };
};

export const markTumbleAt = (progress: number): RelayOffset => {
  const fall = easeInCubic(spanOf(progress, 0.04, 0.6));

  return {
    x: 22 * fall,
    y: 70 * fall * fall,
    rotate: 210 * fall,
    scale: 1 - 0.35 * fall,
    opacity: 1 - spanOf(progress, 0.36, 0.6),
  };
};

export const markShoulderInAt = (progress: number): RelayOffset => ({
  ...NEUTRAL_OFFSET,
  x: -30 * (1 - backOut(spanOf(progress, 0.12, 0.52), 1.8)),
  opacity: easeOutCubic(spanOf(progress, 0.12, 0.3)),
});

export const markDropInAt = (progress: number): RelayOffset => {
  const drop = spanOf(progress, 0.3, 0.88);

  return {
    x: 0,
    y: -48 * (1 - backOut(drop, 2)),
    rotate: -200 * (1 - easeOutCubic(drop)),
    scale: 0.6 + 0.4 * easeOutCubic(drop),
    opacity: spanOf(progress, 0.3, 0.5),
  };
};

export const markSlideOutAt = (progress: number): RelayOffset => {
  const exit = spanOf(progress, 0.04, 0.36);

  return { ...NEUTRAL_OFFSET, x: -28 * easeInCubic(exit), opacity: 1 - exit };
};

export const markCatchAt = (progress: number): RelayOffset => ({
  ...NEUTRAL_OFFSET,
  x: -6 * Math.sin(Math.PI * spanOf(progress, 0.8, 0.98)),
});

export const markWiggleAt = (progress: number): RelayOffset => {
  const sway = spanOf(progress, 0, 0.9);

  return { ...NEUTRAL_OFFSET, rotate: 16 * Math.sin(3 * Math.PI * sway) * (1 - sway) };
};

export const handOffAt = (progress: number): RelayOffset => {
  const exit = spanOf(progress, 0, 0.26);

  return {
    ...NEUTRAL_OFFSET,
    x: -24 * easeInCubic(exit),
    scale: 1 - 0.14 * exit,
    opacity: 1 - exit,
  };
};

export const handInAt = (progress: number): RelayOffset => {
  const entry = spanOf(progress, 0.4, 0.86);

  return { ...NEUTRAL_OFFSET, x: -24 * (1 - easeOutCubic(entry)), opacity: easeOutCubic(entry) };
};

export const passOutAt = (progress: number, direction: number): RelayOffset => {
  const exit = spanOf(progress, 0, 0.42);

  return { ...NEUTRAL_OFFSET, x: direction * 56 * easeInCubic(exit), opacity: 1 - exit };
};

export const passInAt = (progress: number, direction: number): RelayOffset => ({
  ...NEUTRAL_OFFSET,
  x: -direction * 56 * (1 - backOut(spanOf(progress, 0.16, 0.86), 1.4)),
  opacity: spanOf(progress, 0.16, 0.4),
});

export interface RelayTextMetrics {
  glyph: number;
  lineHeight: number;
}

export interface RelayPlacement extends RelayPoint {
  scale: number;
}

export const textPlacementOf = (spot: RelayTextSpot, metrics: RelayTextMetrics): RelayPlacement => {
  const scale = spot.glyph / metrics.glyph;

  return { x: spot.x, y: spot.y - (metrics.lineHeight * scale) / 2, scale };
};

export const fitScaleOf = (scale: number, left: number, width: number, viewport: number): number =>
  Math.min(scale, Math.max(0, viewport - FIT_MARGIN - left) / width);
