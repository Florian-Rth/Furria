import { kkTokens } from '../../../tokens';

export type FanfareStrike = 'impact' | 'quiet';

export type FanfareCrossing = 'down' | 'up' | null;

export interface FanfareLift {
  hold: number;
  scale: number;
  shadowX: number;
  shadowY: number;
  shadowOpacity: number;
  shadowScale: number;
  leaveOpacity: number;
}

export interface FanfarePlacement {
  x: number;
  y: number;
  scale: number;
}

export interface FanfareHeadlineBox {
  left: number;
  top: number;
  width: number;
  height: number;
  glyph: number;
}

export interface FanfareSlotBox {
  left: number;
  top: number;
  height: number;
  glyph: number;
}

export interface FanfareGeometry {
  headline: FanfareHeadlineBox | null;
  slot: FanfareSlotBox;
  copyGlyph: number;
}

export interface FanfarePlan {
  from: FanfarePlacement;
  to: FanfarePlacement;
  shadowX: number;
  shadowY: number;
  strike: FanfareStrike;
  fadesIn: boolean;
}

export interface FanfareFrame {
  copyOpacity: number;
  copyX: number;
  copyY: number;
  copyScale: number;
  copyShadowX: number;
  copyShadowY: number;
  copyShadowOpacity: number;
  restOpacity: number;
  restX: number;
  restY: number;
  restRotate: number;
  restScale: number;
  titleOpacity: number;
  titleScale: number;
  inkOpacity: number;
  inkOffset: number;
  flashOpacity: number;
  glow: number;
  chromeScale: number;
}

interface FanfareTiming {
  anticipate: number;
  slam: number;
  knock: number;
  knockFade: number;
  bounce: number;
}

type Stop = readonly [number, number];

export const FANFARE_THRESHOLD = kkTokens.shell.scrollTravel / 2;

const HEADLINE_LEADING = 1.1;
const LIFT_SCALE = 0.06;
const LIFT_SHADOW_X = 2;
const LIFT_SHADOW_Y = 10;
const LIFT_SHADOW_GROW = 0.04;
const LEAVE_SHARE = 0.4;
const ANTICIPATE_SCALE = 1.04;
const ANTICIPATE_RISE = -6;
const SYNTHETIC_SCALE = 1.7;
const SLAM_POWER = 3;
const INK_OFFSET = 2;
const INK_HOLD = 0.05;
const INK_SINK = 0.2;
const FLASH_SECONDS = 0.42;
const DIP_SECONDS = 0.1;
const DIP_DEPTH = 0.018;
const RING_SCALE = 0.014;
const BEAT_RISE = 0.035;
const BEAT_FALL = 0.13;
const BUZZ_MS = [22, 14, 11, 8] as const;

export const FANFARE_BEATS: readonly Stop[] = [
  [0.15, 1],
  [0.32, 0.58],
  [0.49, 0.32],
];

const TIMING: Record<FanfareStrike, FanfareTiming> = {
  impact: { anticipate: 0.09, slam: 0.19, knock: 0.3, knockFade: 0.1, bounce: 0.38 },
  quiet: { anticipate: 0, slam: 0.2, knock: 0.16, knockFade: 0.12, bounce: 0.22 },
};

const BOUNCE: Record<FanfareStrike, readonly Stop[]> = {
  impact: [
    [0, 1],
    [0.16, 0.93],
    [0.48, 1.04],
    [0.78, 0.992],
    [1, 1],
  ],
  quiet: [
    [0, 1],
    [0.35, 0.97],
    [1, 1],
  ],
};

const KNOCK: Record<FanfareStrike, FanfarePlacement & { rotate: number }> = {
  impact: { x: 10, y: 16, scale: 0.86, rotate: 10 },
  quiet: { x: 0, y: 6, scale: 1, rotate: 0 },
};

const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

const lerp = (from: number, to: number, amount: number): number => from + (to - from) * amount;

const easeOut = (progress: number): number => 1 - (1 - progress) ** 2;

const slamEase = (progress: number): number => progress ** SLAM_POWER;

const along = (progress: number, stops: readonly Stop[]): number => {
  const first = stops[0];

  if (first === undefined) {
    return 0;
  }

  let previous: Stop = first;

  for (const stop of stops) {
    if (progress <= stop[0]) {
      const span = stop[0] - previous[0];
      const share = span <= 0 ? 1 : (progress - previous[0]) / span;
      const smooth = (1 - Math.cos(Math.PI * share)) / 2;

      return lerp(previous[1], stop[1], smooth);
    }

    previous = stop;
  }

  return previous[1];
};

const placementBetween = (
  from: FanfarePlacement,
  to: FanfarePlacement,
  amount: number,
): FanfarePlacement => ({
  x: lerp(from.x, to.x, amount),
  y: lerp(from.y, to.y, amount),
  scale: lerp(from.scale, to.scale, amount),
});

export const liftAt = (scrollOffset: number): FanfareLift => {
  const progress = clamp01(scrollOffset / FANFARE_THRESHOLD);
  const lift = easeOut(progress);
  const leaving = clamp01(scrollOffset / (FANFARE_THRESHOLD * LEAVE_SHARE));

  return {
    hold: FANFARE_THRESHOLD * progress,
    scale: 1 + LIFT_SCALE * lift,
    shadowX: LIFT_SHADOW_X * lift,
    shadowY: LIFT_SHADOW_Y * lift,
    shadowOpacity: lift,
    shadowScale: 1 + LIFT_SHADOW_GROW * lift,
    leaveOpacity: 1 - leaving,
  };
};

export const crossingOf = (previous: number, next: number): FanfareCrossing => {
  if (previous < FANFARE_THRESHOLD && next >= FANFARE_THRESHOLD) {
    return 'down';
  }

  if (previous >= FANFARE_THRESHOLD && next < FANFARE_THRESHOLD) {
    return 'up';
  }

  return null;
};

export const contactOf = (strike: FanfareStrike): number =>
  TIMING[strike].anticipate + TIMING[strike].slam;

export const strikeDurationOf = (strike: FanfareStrike): number => {
  const lastBeat = FANFARE_BEATS[FANFARE_BEATS.length - 1]?.[0] ?? 0;
  const tail = strike === 'impact' ? lastBeat + BEAT_FALL : TIMING[strike].bounce;

  return contactOf(strike) + Math.max(tail, TIMING[strike].knock, TIMING[strike].bounce);
};

const slotPlacementOf = (slot: FanfareSlotBox, glyph: number): FanfarePlacement => {
  const scale = slot.glyph / glyph;

  return {
    x: slot.left,
    y: slot.top + slot.height / 2 - (glyph * HEADLINE_LEADING * scale) / 2,
    scale,
  };
};

export const planStrike = (
  geometry: FanfareGeometry,
  scrollOffset: number,
  strike: FanfareStrike,
): FanfarePlan => {
  const { headline, slot, copyGlyph } = geometry;
  const lift = liftAt(scrollOffset);

  if (headline === null) {
    const to = slotPlacementOf(slot, copyGlyph);
    const from = { ...to, scale: to.scale * SYNTHETIC_SCALE };

    return { from, to, shadowX: lift.shadowX, shadowY: lift.shadowY, strike, fadesIn: true };
  }

  const top = headline.top - scrollOffset + lift.hold;

  return {
    from: {
      x: headline.left,
      y: top + (headline.height * (1 - lift.scale)) / 2,
      scale: lift.scale,
    },
    to: slotPlacementOf(slot, headline.glyph),
    shadowX: lift.shadowX,
    shadowY: lift.shadowY,
    strike,
    fadesIn: false,
  };
};

const flightOf = (time: number, plan: FanfarePlan): FanfarePlacement => {
  const { anticipate, slam } = TIMING[plan.strike];
  const raised = {
    x: plan.from.x,
    y: plan.from.y + (plan.strike === 'impact' ? ANTICIPATE_RISE : 0),
    scale: plan.from.scale * (plan.strike === 'impact' ? ANTICIPATE_SCALE : 1),
  };

  if (time < anticipate) {
    return placementBetween(plan.from, raised, easeOut(time / anticipate));
  }

  return placementBetween(raised, plan.to, slamEase(clamp01((time - anticipate) / slam)));
};

const pulseOf = (since: number, beat: Stop): number => {
  const [peak, amplitude] = beat;

  if (since < peak - BEAT_RISE || since > peak + BEAT_FALL) {
    return 0;
  }

  if (since <= peak) {
    return amplitude * easeOut((since - (peak - BEAT_RISE)) / BEAT_RISE);
  }

  return amplitude * (1 - clamp01((since - peak) / BEAT_FALL)) ** 2;
};

export const ringAt = (since: number): number =>
  Math.max(0, ...FANFARE_BEATS.map((beat) => pulseOf(since, beat)));

const dipAt = (since: number): number =>
  since < 0 || since > DIP_SECONDS ? 0 : DIP_DEPTH * Math.sin((Math.PI * since) / DIP_SECONDS);

const inkAt = (since: number): number => {
  if (since < 0) {
    return 0;
  }

  return 1 - easeOut(clamp01((since - INK_HOLD) / INK_SINK));
};

export const strikeFrameAt = (time: number, plan: FanfarePlan): FanfareFrame => {
  const timing = TIMING[plan.strike];
  const contact = contactOf(plan.strike);
  const since = time - contact;
  const landed = since >= 0;
  const flight = flightOf(Math.min(time, contact), plan);
  const slamShare = clamp01(time / contact);
  const knock = landed ? easeOut(clamp01(since / timing.knock)) : 0;
  const knockTo = KNOCK[plan.strike];
  const impact = plan.strike === 'impact';
  const ink = impact ? inkAt(since) : 0;
  const glow = impact && landed ? ringAt(since) : 0;
  const fadeIn = plan.fadesIn ? clamp01(time / Math.max(timing.anticipate, timing.slam / 2)) : 1;

  return {
    copyOpacity: landed ? 0 : fadeIn,
    copyX: flight.x,
    copyY: flight.y,
    copyScale: flight.scale,
    copyShadowX: plan.shadowX * (1 - slamShare),
    copyShadowY: plan.shadowY * (1 - slamShare),
    copyShadowOpacity: 1 - slamShare,
    restOpacity: landed ? 1 - clamp01(since / timing.knockFade) : 1,
    restX: knockTo.x * knock,
    restY: knockTo.y * knock,
    restRotate: knockTo.rotate * knock,
    restScale: lerp(1, knockTo.scale, knock),
    titleOpacity: landed ? 1 : 0,
    titleScale: landed ? along(clamp01(since / timing.bounce), BOUNCE[plan.strike]) : 1,
    inkOpacity: ink,
    inkOffset: INK_OFFSET * ink,
    flashOpacity: impact && landed ? 1 - clamp01(since / FLASH_SECONDS) ** 2 : 0,
    glow,
    chromeScale: impact && landed ? 1 + RING_SCALE * glow - dipAt(since) : 1,
  };
};

export const buzzPatternOf = (contactSeconds: number): number[] => {
  const contactMs = Math.round(contactSeconds * 1000);
  const hits = [0, ...FANFARE_BEATS.map(([peak]) => Math.round(peak * 1000))];
  const pattern = [0, contactMs];

  hits.forEach((hit, index) => {
    const buzz = BUZZ_MS[index] ?? 0;
    const next = hits[index + 1];
    pattern.push(buzz);

    if (next !== undefined) {
      pattern.push(next - hit - buzz);
    }
  });

  return pattern;
};
