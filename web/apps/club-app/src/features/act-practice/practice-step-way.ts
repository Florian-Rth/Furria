import type { SpotPath } from '@/features/act-player/choreography-motion';
import { poseAt } from '@/features/act-player/choreography-motion';
import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import { EDGE_TOLERANCE_SECONDS } from '@/features/act-player/music-timeline';
import type { StudioStage } from '@/features/acts/schemas';
import type { ViewShare } from './practice-stage';
import { viewShareOf } from './practice-stage';

const SAMPLES_PER_COUNT = 4;
const SAMPLES_WITHOUT_COUNTS = 24;
const STILL_SHARE = 0.005;
const MARK_SPACING_SHARE = 0.07;

export interface StepWayMark extends ViewShare {
  count: number;
}

export interface StepWay {
  points: ViewShare[];
  marks: StepWayMark[];
}

const distanceOf = (left: ViewShare, right: ViewShare): number =>
  Math.hypot(left.x - right.x, left.y - right.y);

const timesBetween = (from: number, to: number, samples: number): number[] =>
  Array.from({ length: samples }, (_, index) => from + ((to - from) * (index + 1)) / samples);

const sampleTimesOf = (beats: readonly number[], from: number, to: number): number[] => {
  if (beats.length === 0) {
    return [from, ...timesBetween(from, to, SAMPLES_WITHOUT_COUNTS)];
  }

  const stops = [from, ...beats, ...(beats.at(-1) === to ? [] : [to])];

  return [
    from,
    ...stops
      .slice(1)
      .flatMap((stop, index) => timesBetween(stops[index] ?? from, stop, SAMPLES_PER_COUNT)),
  ];
};

export const stepWayOf = (
  path: SpotPath,
  marks: readonly CountMark[],
  range: TimelineRange,
  seconds: number,
  stage: StudioStage,
): StepWay | null => {
  const from = Math.max(seconds, range.start);
  const to = range.end;

  if (to - from <= EDGE_TOLERANCE_SECONDS) {
    return null;
  }

  const shareAt = (time: number): ViewShare | null => {
    const pose = poseAt(path, time);
    return pose === null ? null : viewShareOf(pose.position, stage);
  };
  const beats = marks.filter(
    (mark) => mark.seconds > from + EDGE_TOLERANCE_SECONDS && mark.seconds <= to,
  );
  const points = sampleTimesOf(
    beats.map((mark) => mark.seconds),
    from,
    to,
  ).flatMap((time) => shareAt(time) ?? []);
  const travel = points
    .slice(1)
    .reduce((sum, point, index) => sum + distanceOf(points[index] ?? point, point), 0);

  if (travel < STILL_SHARE) {
    return null;
  }

  const wayMarks: StepWayMark[] = [];
  let before = points[0] ?? null;
  let labelled = before;
  for (const beat of beats) {
    const place = shareAt(beat.seconds);
    if (place !== null && before !== null && labelled !== null) {
      const moved = distanceOf(before, place) >= STILL_SHARE;
      if (moved && distanceOf(labelled, place) >= MARK_SPACING_SHARE) {
        wayMarks.push({ ...place, count: beat.count });
        labelled = place;
      }
      before = place;
    }
  }

  return { points, marks: wayMarks };
};
