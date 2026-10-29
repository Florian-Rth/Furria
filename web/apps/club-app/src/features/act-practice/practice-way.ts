import type { StagePoint, TimedKeyframe } from '@/features/act-player/choreography-motion';
import { easedProgress, pointOnMove } from '@/features/act-player/choreography-motion';
import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';

const LOOKAHEAD_COUNTS = 8;
const LOOKAHEAD_SECONDS_WITHOUT_COUNTS = 4;
const FRESH_SECONDS_WITHOUT_COUNTS = 0.5;
const BEND_SAMPLES = 16;
const EDGE_TOLERANCE_SECONDS = 1e-6;

export type OwnWay =
  | { phase: 'still' }
  | { phase: 'soon'; counts: number | null; route: StagePoint[] }
  | { phase: 'now'; fresh: boolean; route: StagePoint[] };

interface Move {
  from: TimedKeyframe;
  to: TimedKeyframe;
}

const STILL: OwnWay = { phase: 'still' };

const isMoving = ({ from, to }: Move): boolean =>
  to.bend !== null ||
  from.position.rightMetres !== to.position.rightMetres ||
  from.position.backMetres !== to.position.backMetres;

const movesOf = (keyframes: readonly TimedKeyframe[]): Move[] =>
  keyframes.slice(1).map((to, index) => ({ from: keyframes[index] ?? to, to }));

const sampledMove = (move: Move, fromProgress: number): StagePoint[] => {
  const { from, to } = move;

  if (to.bend === null) {
    return [pointOnMove(from.position, to.position, null, fromProgress), to.position];
  }

  const points: StagePoint[] = [];
  for (let sample = 0; sample <= BEND_SAMPLES; sample += 1) {
    const progress = fromProgress + ((1 - fromProgress) * sample) / BEND_SAMPLES;
    points.push(pointOnMove(from.position, to.position, to.bend, progress));
  }

  return points;
};

const runFrom = (moves: readonly Move[], index: number): Move[] => {
  const run: Move[] = [];
  for (let cursor = index; cursor < moves.length; cursor += 1) {
    const move = moves[cursor];
    if (move === undefined || !isMoving(move)) {
      break;
    }
    run.push(move);
  }

  return run;
};

const runStartOf = (moves: readonly Move[], index: number): Move | undefined => {
  let cursor = index;
  for (; cursor > 0; cursor -= 1) {
    const before = moves[cursor - 1];
    if (before === undefined || !isMoving(before)) {
      break;
    }
  }

  return moves[cursor];
};

const routeOf = (run: readonly Move[], firstProgress: number): StagePoint[] =>
  run.flatMap((move, index) => {
    const points = sampledMove(move, index === 0 ? firstProgress : 0);
    return index === 0 ? points : points.slice(1);
  });

export const countsBetween = (marks: readonly CountMark[], from: number, to: number): number =>
  marks.filter(
    (mark) =>
      mark.seconds > from + EDGE_TOLERANCE_SECONDS && mark.seconds <= to + EDGE_TOLERANCE_SECONDS,
  ).length;

const nowWay = (
  moves: readonly Move[],
  index: number,
  move: Move,
  marks: readonly CountMark[],
  seconds: number,
): OwnWay => {
  const runStart = runStartOf(moves, index)?.from.seconds ?? move.from.seconds;
  const progress = easedProgress(
    move.to.easing,
    (seconds - move.from.seconds) / (move.to.seconds - move.from.seconds),
  );
  const fresh =
    marks.length === 0
      ? seconds - runStart < FRESH_SECONDS_WITHOUT_COUNTS
      : countsBetween(marks, runStart, seconds) === 0;

  return { phase: 'now', fresh, route: routeOf(runFrom(moves, index), progress) };
};

const soonWay = (
  moves: readonly Move[],
  marks: readonly CountMark[],
  seconds: number,
  loop: TimelineRange | null,
): OwnWay => {
  const index = moves.findIndex(
    (move) => isMoving(move) && move.from.seconds >= seconds - EDGE_TOLERANCE_SECONDS,
  );
  const next = moves[index];

  if (next === undefined || (loop !== null && next.from.seconds >= loop.end)) {
    return STILL;
  }

  const route = routeOf(runFrom(moves, index), 0);

  if (marks.length === 0) {
    return next.from.seconds - seconds <= LOOKAHEAD_SECONDS_WITHOUT_COUNTS
      ? { phase: 'soon', counts: null, route }
      : STILL;
  }

  const counts = countsBetween(marks, seconds, next.from.seconds);

  return counts > LOOKAHEAD_COUNTS ? STILL : { phase: 'soon', counts: Math.max(1, counts), route };
};

export const ownWayAt = (
  keyframes: readonly TimedKeyframe[],
  marks: readonly CountMark[],
  seconds: number,
  loop: TimelineRange | null,
): OwnWay => {
  const moves = movesOf(keyframes);
  const index = moves.findIndex(
    (move) => seconds >= move.from.seconds && seconds < move.to.seconds,
  );
  const move = moves[index];

  if (move !== undefined && isMoving(move)) {
    return nowWay(moves, index, move, marks, seconds);
  }

  return soonWay(moves, marks, seconds, loop);
};

export type OwnCue = { tone: 'now' } | { tone: 'soon'; counts: number };

export const cueOf = (way: OwnWay): OwnCue | null => {
  if (way.phase === 'now') {
    return way.fresh ? { tone: 'now' } : null;
  }

  return way.phase === 'soon' && way.counts !== null ? { tone: 'soon', counts: way.counts } : null;
};
