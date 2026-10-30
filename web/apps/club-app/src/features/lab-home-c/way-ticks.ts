import type { StagePoint, TimedKeyframe } from '@/features/act-player/choreography-motion';
import { poseAt } from '@/features/act-player/choreography-motion';
import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import type { ViewShare } from '@/features/act-practice/practice-stage';
import { ownWayAt } from '@/features/act-practice/practice-way';

const EDGE_TOLERANCE_SECONDS = 1e-6;
const MOST_TICKS = 32;
const PATH_SPOT_ID = 0;

export interface WayTick {
  seconds: number;
  count: number;
  labelled: boolean;
  point: StagePoint;
}

export interface ShownTick {
  key: string;
  x: number;
  y: number;
  count: number | null;
}

interface Move {
  from: TimedKeyframe;
  to: TimedKeyframe;
}

const isMoving = ({ from, to }: Move): boolean =>
  to.bend !== null ||
  from.position.rightMetres !== to.position.rightMetres ||
  from.position.backMetres !== to.position.backMetres;

const movesOf = (keyframes: readonly TimedKeyframe[]): Move[] =>
  keyframes.slice(1).map((to, index) => ({ from: keyframes[index] ?? to, to }));

const runIndexOf = (moves: readonly Move[], seconds: number): number => {
  const current = moves.findIndex(
    (move) => isMoving(move) && seconds >= move.from.seconds && seconds < move.to.seconds,
  );

  return current >= 0
    ? current
    : moves.findIndex(
        (move) => isMoving(move) && move.from.seconds >= seconds - EDGE_TOLERANCE_SECONDS,
      );
};

const runEndOf = (moves: readonly Move[], index: number): number => {
  let end = moves[index]?.to.seconds ?? 0;
  for (let cursor = index + 1; cursor < moves.length; cursor += 1) {
    const move = moves[cursor];
    if (move === undefined || !isMoving(move)) {
      break;
    }
    end = move.to.seconds;
  }

  return end;
};

export const wayTicksAt = (
  keyframes: readonly TimedKeyframe[],
  marks: readonly CountMark[],
  seconds: number,
  loop: TimelineRange | null,
): WayTick[] => {
  if (ownWayAt(keyframes, marks, seconds, loop).phase === 'still') {
    return [];
  }

  const moves = movesOf(keyframes);
  const index = runIndexOf(moves, seconds);
  const first = moves[index];

  if (first === undefined) {
    return [];
  }

  const from = Math.max(seconds, first.from.seconds);
  const runEnd = runEndOf(moves, index);
  const to = loop === null ? runEnd : Math.min(runEnd, loop.end);
  const path = { spotId: PATH_SPOT_ID, keyframes };

  const ahead = marks
    .filter(
      (mark) =>
        mark.seconds > from + EDGE_TOLERANCE_SECONDS && mark.seconds <= to + EDGE_TOLERANCE_SECONDS,
    )
    .slice(0, MOST_TICKS);
  const firstEightCounts = new Set<number>();
  let eight = 0;

  return ahead.flatMap((mark, index) => {
    if (index > 0 && mark.count === 1) {
      eight += 1;
    }
    if (eight === 0) {
      firstEightCounts.add(mark.count);
    }
    const arrival = index === ahead.length - 1 && !firstEightCounts.has(mark.count);
    const pose = poseAt(path, mark.seconds);

    return pose === null
      ? []
      : [
          {
            seconds: mark.seconds,
            count: mark.count,
            labelled: eight === 0 || arrival,
            point: pose.position,
          },
        ];
  });
};

const distanceOf = (left: ViewShare, right: ViewShare, aspect: number): number =>
  Math.hypot(left.x - right.x, (left.y - right.y) * aspect);

const ANCHOR_ROOM = 1.4;

export const spacedTicksOf = (
  ticks: readonly ShownTick[],
  anchor: ViewShare | null,
  minGap: number,
  aspect: number,
): ShownTick[] => {
  const kept: ShownTick[] = [];

  ticks.forEach((tick, index) => {
    const before = kept.at(-1);
    const last = index === ticks.length - 1;
    const clearOfAnchor =
      anchor === null || distanceOf(anchor, tick, aspect) >= minGap * ANCHOR_ROOM;

    if (!clearOfAnchor && !last) {
      return;
    }
    if (before === undefined || distanceOf(before, tick, aspect) >= minGap) {
      kept.push(tick);
      return;
    }
    if (last) {
      kept.pop();
      kept.push(tick);
    }
  });

  return kept;
};
