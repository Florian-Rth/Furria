import { kkTokens } from '../../../tokens';

export interface DockBox {
  left: number;
  top: number;
  width: number;
  height: number;
  glyph: number;
}

export interface DockGeometry {
  headline: DockBox;
  slot: DockBox;
  headlineText: string;
  titleWidth: number;
}

export interface DockPlacement {
  x: number;
  y: number;
  scale: number;
}

export interface DockStage {
  realHeadlineOpacity: number;
  flightOpacity: number;
  headerOpacity: number;
  headerDrift: number;
  restOpacity: number;
  restShiftX: number;
  restShiftY: number;
  titleOpacity: number;
}

const DOCK_SHARE = 0.8;

export const DOCK_TRAVEL = kkTokens.shell.scrollTravel * DOCK_SHARE;

const HEADER_LEAVE_END = 0.5;
const SHOVE_FROM = 0.2;
const SHOVE_TO = 0.5;
const PLAIN_TITLE_FROM = 0.55;
const SHOVE_X = 10;
const SHOVE_Y = -12;
const LANDING_MOMENTUM = 0.4;

const lerp = (from: number, to: number, amount: number): number => from + (to - from) * amount;

const ramp = (value: number, from: number, to: number): number =>
  Math.min(Math.max((value - from) / (to - from), 0), 1);

const glideOf = (progress: number): number =>
  LANDING_MOMENTUM * progress + (1 - LANDING_MOMENTUM) * (1 - (1 - progress) ** 2);

const liftOf = (progress: number): number => progress * progress;

export const dockProgressAt = (scrollOffset: number, travel: number): number =>
  Math.min(Math.max(scrollOffset / travel, 0), 1);

export const dockStageAt = (progress: number, docking: boolean, headerDrift: number): DockStage => {
  const leaving = ramp(progress, 0, HEADER_LEAVE_END);
  const shove = ramp(progress, SHOVE_FROM, SHOVE_TO);
  const inFlight = progress > 0 && progress < 1;
  const docked = progress >= 1 ? 1 : 0;

  return {
    realHeadlineOpacity: progress > 0 ? 0 : 1,
    flightOpacity: docking && inFlight ? 1 : 0,
    headerOpacity: 1 - leaving,
    headerDrift: -headerDrift * leaving,
    restOpacity: 1 - shove,
    restShiftX: SHOVE_X * shove,
    restShiftY: SHOVE_Y * shove,
    titleOpacity: docking ? docked : ramp(progress, PLAIN_TITLE_FROM, 1),
  };
};

export const dockFlightAt = (
  scrollOffset: number,
  geometry: DockGeometry,
  travel: number,
): DockPlacement => {
  const progress = dockProgressAt(scrollOffset, travel);
  const glide = glideOf(progress);
  const { headline, slot } = geometry;
  const scale = lerp(1, slot.glyph / headline.glyph, glide);
  const left = lerp(headline.left, slot.left, glide);
  const centerY = lerp(
    headline.top - scrollOffset + headline.height / 2,
    slot.top + slot.height / 2,
    liftOf(progress),
  );

  return {
    x: left - headline.left,
    y: centerY - (headline.height * scale) / 2 - headline.top,
    scale,
  };
};

export const landingDue = (previous: number, next: number, landed: boolean): boolean =>
  !landed && previous < 1 && next >= 1;
