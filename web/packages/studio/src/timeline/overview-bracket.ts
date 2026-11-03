import { HIT_MIN_SIZE } from '../gestures/hit-priority';
import type { CentreView } from './centre-scrub';
import type { ShareSpan } from './timeline-geometry';

export type BracketEdge = 'start' | 'end';

export type BracketGrip = BracketEdge | 'body' | 'track';

export type BracketKey = 'earlier' | 'later' | 'closer' | 'wider';

export interface BracketGrab {
  grip: BracketGrip;
  view: CentreView;
  offset: number;
}

export type BracketMove =
  | { kind: 'centre'; seconds: number }
  | { kind: 'frame'; start: number; end: number };

const EDGE_REACH = HIT_MIN_SIZE / 2;
const INNER_EDGE_SHARE = 0.25;
const MIN_VIEW_SECONDS = 1;
const PAN_SHARE = 0.25;

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

export const bracketSharesOf = (view: CentreView, length: number): ShareSpan =>
  length <= 0
    ? { from: 0, to: 0 }
    : { from: clamp(view.start / length, 0, 1), to: clamp(view.end / length, 0, 1) };

export const bracketGripOf = (x: number, width: number, bracket: ShareSpan): BracketGrip => {
  const left = bracket.from * width;
  const right = bracket.to * width;
  const inner = Math.min(EDGE_REACH, (right - left) * INNER_EDGE_SHARE);
  const nearStart = x >= left - EDGE_REACH && x <= left + inner;
  const nearEnd = x >= right - inner && x <= right + EDGE_REACH;
  if (nearStart && nearEnd) {
    return Math.abs(x - left) <= Math.abs(x - right) ? 'start' : 'end';
  }
  if (nearStart) {
    return 'start';
  }
  if (nearEnd) {
    return 'end';
  }

  return x > left && x < right ? 'body' : 'track';
};

const grabbedSecondsOf = (grip: BracketGrip, view: CentreView): number | null => {
  if (grip === 'start') {
    return view.start;
  }
  if (grip === 'end') {
    return view.end;
  }

  return grip === 'body' ? (view.start + view.end) / 2 : null;
};

export const bracketGrabOf = (
  grip: BracketGrip,
  view: CentreView,
  seconds: number,
): BracketGrab => {
  const grabbed = grabbedSecondsOf(grip, view);

  return { grip, view, offset: grabbed === null ? 0 : seconds - grabbed };
};

const resizedViewOf = (
  view: CentreView,
  edge: BracketEdge,
  seconds: number,
  length: number,
): CentreView => {
  const shownStart = Math.max(0, view.start);
  const shownEnd = Math.min(length, view.end);
  const start = edge === 'start' ? clamp(seconds, 0, shownEnd - MIN_VIEW_SECONDS) : shownStart;
  const end = edge === 'end' ? clamp(seconds, shownStart + MIN_VIEW_SECONDS, length) : shownEnd;

  return { start, end: Math.max(end, start + MIN_VIEW_SECONDS) };
};

export const bracketMoveOf = (grab: BracketGrab, seconds: number, length: number): BracketMove => {
  if (grab.grip === 'start' || grab.grip === 'end') {
    const framed = resizedViewOf(grab.view, grab.grip, seconds - grab.offset, length);
    return { kind: 'frame', start: framed.start, end: framed.end };
  }

  return { kind: 'centre', seconds: clamp(seconds - grab.offset, 0, Math.max(length, 0)) };
};

export const pannedCentreOf = (view: CentreView, direction: 1 | -1, length: number): number =>
  clamp(
    (view.start + view.end) / 2 + direction * (view.end - view.start) * PAN_SHARE,
    0,
    Math.max(length, 0),
  );
