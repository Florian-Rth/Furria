import type {
  KkStudioCBlockState,
  KkStudioCCut,
  KkStudioCDot,
  KkStudioCMark,
  KkStudioCSpan,
  KkStudioCTick,
} from '@furria/ui/studio-c-types';
import type { SpotPath, SpotPose } from '@/features/act-player/choreography-motion';
import type { CountMark, MusicSegment, TimelineRange } from '@/features/act-player/music-timeline';
import { partRangeOf, stepRangeOf } from '@/features/act-player/music-timeline';
import type { StageViewpoint } from '@/features/act-player/stage-view';
import { viewPointOf, viewRotationOf } from '@/features/act-player/stage-view';
import { isPlayableVideo } from '@/features/act-player/video-sync';
import type {
  StudioPart,
  StudioSong,
  StudioSpot,
  StudioStage,
  StudioStep,
  StudioVideo,
} from '@/features/acts/schemas';

const COUNTS_PER_EIGHT = 8;
const FALLBACK_EIGHT_SECONDS = 4;
const PHONE_WIDTH = 600;
const TABLET_WIDTH = 1000;
const SECONDS_PER_MINUTE = 60;
const TENTHS = 10;
const MIN_RATE = 0.5;
const MAX_RATE = 1;
const RATE_STEP = 0.1;
const FILE_EXTENSION = /\.[a-z0-9]{2,4}$/i;

export interface MotionSpan {
  start: number;
  end: number;
  moving: boolean;
}

export interface VideoSpan {
  videoId: number;
  name: string | null;
  start: number;
  end: number;
}

export type RateDirection = 'slower' | 'faster';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const medianOf = (values: readonly number[]): number | null => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = sorted[Math.floor(sorted.length / 2)];

  return middle ?? null;
};

export const eightSecondsOf = (marks: readonly CountMark[]): number => {
  const gaps = marks
    .slice(1)
    .map((mark, index) => mark.seconds - (marks[index]?.seconds ?? mark.seconds))
    .filter((gap) => gap > 0);
  const beat = medianOf(gaps);

  return beat === null ? FALLBACK_EIGHT_SECONDS : beat * COUNTS_PER_EIGHT;
};

export const eightsInViewOf = (viewportWidth: number): number => {
  if (viewportWidth < PHONE_WIDTH) {
    return 2;
  }

  return viewportWidth < TABLET_WIDTH ? 3 : 5;
};

export const pixelsPerSecondOf = (viewportWidth: number, eightSeconds: number): number =>
  viewportWidth <= 0 || eightSeconds <= 0
    ? 0
    : viewportWidth / (eightSeconds * eightsInViewOf(viewportWidth));

export const trackShiftOf = (
  seconds: number,
  pixelsPerSecond: number,
  viewportWidth: number,
): number => viewportWidth / 2 - seconds * pixelsPerSecond;

export const scrubSecondsOf = (
  startSeconds: number,
  dragPixels: number,
  pixelsPerSecond: number,
  length: number,
): number =>
  pixelsPerSecond <= 0
    ? startSeconds
    : clamp(startSeconds - dragPixels / pixelsPerSecond, 0, length);

const samePlace = (path: SpotPath, index: number): boolean => {
  const from = path.keyframes[index - 1]?.position;
  const to = path.keyframes[index]?.position;

  return (
    from !== undefined &&
    to !== undefined &&
    from.rightMetres === to.rightMetres &&
    from.backMetres === to.backMetres
  );
};

const mergeSpans = (spans: readonly MotionSpan[]): MotionSpan[] => {
  const merged: MotionSpan[] = [];

  for (const span of spans) {
    const last = merged.at(-1);

    if (last !== undefined && last.moving === span.moving) {
      last.end = span.end;
    } else {
      merged.push({ ...span });
    }
  }

  return merged;
};

export const motionSpansOf = (path: SpotPath | null, length: number): MotionSpan[] => {
  const first = path?.keyframes[0];
  const last = path?.keyframes.at(-1);

  if (path === null || first === undefined || last === undefined || length <= 0) {
    return [];
  }

  const between = path.keyframes.slice(1).map((keyframe, offset) => ({
    start: path.keyframes[offset]?.seconds ?? keyframe.seconds,
    end: keyframe.seconds,
    moving: !samePlace(path, offset + 1),
  }));
  const spans = [
    { start: 0, end: first.seconds, moving: false },
    ...between,
    { start: last.seconds, end: length, moving: false },
  ]
    .map((span) => ({
      ...span,
      start: clamp(span.start, 0, length),
      end: clamp(span.end, 0, length),
    }))
    .filter((span) => span.end > span.start);

  return mergeSpans(spans);
};

export const videoSpansOf = (videos: readonly StudioVideo[], length: number): VideoSpan[] =>
  videos
    .filter(isPlayableVideo)
    .map((video) => {
      const start = video.startSeconds ?? 0;

      return {
        videoId: video.videoId,
        name: video.name,
        start,
        end: Math.min(length, start + (video.durationSeconds ?? 0)),
      };
    })
    .filter((span) => span.end > span.start)
    .sort((left, right) => left.start - right.start);

export const songNameOf = (fileName: string): string => fileName.replace(FILE_EXTENSION, '');

export const songCutsOf = (
  segments: readonly MusicSegment[],
  songs: readonly StudioSong[],
  pixelsPerSecond: number,
): KkStudioCCut[] =>
  segments.map((segment) => {
    const song = songs.find((candidate) => candidate.mediaItemId === segment.mediaItemId);

    return {
      key: `${segment.mediaItemId}-${segment.timelineStart}`,
      x: segment.timelineStart * pixelsPerSecond,
      width: (segment.timelineEnd - segment.timelineStart) * pixelsPerSecond,
      label: song === undefined ? '' : songNameOf(song.fileName),
    };
  });

export const ticksOf = (marks: readonly CountMark[], pixelsPerSecond: number): KkStudioCTick[] =>
  marks.map((mark) => ({
    key: `${mark.seconds}`,
    x: mark.seconds * pixelsPerSecond,
    count: mark.count,
  }));

export const spansOnTrack = (
  spans: readonly MotionSpan[],
  pixelsPerSecond: number,
): KkStudioCSpan[] =>
  spans.map((span) => ({
    key: `${span.start}`,
    left: span.start * pixelsPerSecond,
    width: (span.end - span.start) * pixelsPerSecond,
    label: null,
    tone: span.moving ? 'moving' : 'still',
  }));

export const videoSpansOnTrack = (
  spans: readonly VideoSpan[],
  pixelsPerSecond: number,
): KkStudioCSpan[] =>
  spans.map((span) => ({
    key: `${span.videoId}`,
    left: span.start * pixelsPerSecond,
    width: (span.end - span.start) * pixelsPerSecond,
    label: span.name,
    tone: 'video',
  }));

const sameRange = (left: TimelineRange | null, right: TimelineRange | null): boolean =>
  left !== null && right !== null && left.start === right.start && left.end === right.end;

export const blockStateOf = (
  range: TimelineRange | null,
  loop: TimelineRange | null,
  current: boolean,
): KkStudioCBlockState => {
  if (sameRange(range, loop)) {
    return 'looped';
  }

  return current ? 'current' : 'idle';
};

export const nextRateOf = (rate: number, direction: RateDirection): number => {
  const shifted = direction === 'slower' ? rate - RATE_STEP : rate + RATE_STEP;

  return clamp(Math.round(shifted * TENTHS) / TENTHS, MIN_RATE, MAX_RATE);
};

export const canShiftRate = (rate: number, direction: RateDirection): boolean =>
  nextRateOf(rate, direction) !== rate;

export const ratePercentOf = (rate: number): string => `${Math.round(rate * 100)} %`;

const twoDigits = (value: number): string => `${value}`.padStart(2, '0');

export const clockOf = (seconds: number): string => {
  const tenths = Math.floor(Math.max(0, seconds) * TENTHS);
  const minutes = Math.floor(tenths / (SECONDS_PER_MINUTE * TENTHS));
  const wholeSeconds = Math.floor(tenths / TENTHS) % SECONDS_PER_MINUTE;

  return `${minutes}:${twoDigits(wholeSeconds)},${tenths % TENTHS}`;
};

export const minuteOf = (seconds: number): string => {
  const whole = Math.round(Math.max(0, seconds));

  return `${Math.floor(whole / SECONDS_PER_MINUTE)}:${twoDigits(whole % SECONDS_PER_MINUTE)}`;
};

export const rangeLabelOf = (range: TimelineRange | null): string =>
  range === null ? '' : `${minuteOf(range.start)}–${minuteOf(range.end)}`;

const dotKindOf = (
  spot: StudioSpot | undefined,
  ownSpotId: number | null,
): KkStudioCDot['kind'] => {
  if (spot !== undefined && spot.spotId === ownSpotId) {
    return 'own';
  }

  return spot?.person === null ? 'open' : 'cast';
};

export const dotsOf = (
  poses: readonly SpotPose[],
  spots: readonly StudioSpot[],
  ownSpotId: number | null,
  stage: StudioStage,
  viewpoint: StageViewpoint,
): KkStudioCDot[] =>
  poses
    .map((pose) => {
      const spot = spots.find((candidate) => candidate.spotId === pose.spotId);
      const point = viewPointOf(pose.position, stage, viewpoint);

      return {
        id: `${pose.spotId}`,
        x: point.x,
        y: point.y,
        number: spot?.number ?? 0,
        kind: dotKindOf(spot, ownSpotId),
        rotation: viewRotationOf(pose.facingDegrees, viewpoint),
      };
    })
    .sort((left, right) => Number(left.kind === 'own') - Number(right.kind === 'own'));

export interface TimelineBlock<T> {
  item: T;
  left: number;
  width: number;
  number: string | null;
  meta: string | null;
  state: KkStudioCBlockState;
}

export const stepBlocksOf = (
  steps: readonly StudioStep[],
  loop: TimelineRange | null,
  currentStepId: number | null,
  pixelsPerSecond: number,
): TimelineBlock<StudioStep>[] =>
  steps.flatMap((step, index) => {
    const range = stepRangeOf(step);

    return range === null
      ? []
      : [
          {
            item: step,
            left: range.start * pixelsPerSecond,
            width: (range.end - range.start) * pixelsPerSecond,
            number: `${index + 1}`,
            meta: rangeLabelOf(range),
            state: blockStateOf(range, loop, step.stepId === currentStepId),
          },
        ];
  });

export const partBlocksOf = (
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
  loop: TimelineRange | null,
  currentPartId: number | null,
  pixelsPerSecond: number,
): TimelineBlock<StudioPart>[] =>
  parts.flatMap((part) => {
    const range = partRangeOf(part, steps);

    return range === null
      ? []
      : [
          {
            item: part,
            left: range.start * pixelsPerSecond,
            width: (range.end - range.start) * pixelsPerSecond,
            number: null,
            meta: null,
            state: blockStateOf(range, loop, part.partId === currentPartId),
          },
        ];
  });

export const loopSpanOf = (
  loop: TimelineRange | null,
  pixelsPerSecond: number,
): { left: number; width: number } | null =>
  loop === null
    ? null
    : { left: loop.start * pixelsPerSecond, width: (loop.end - loop.start) * pixelsPerSecond };

export const keyframeMarksOf = (
  paths: readonly SpotPath[],
  pixelsPerSecond: number,
): KkStudioCMark[] =>
  [...new Set(paths.flatMap((path) => path.keyframes.map((keyframe) => keyframe.seconds)))]
    .sort((left, right) => left - right)
    .map((seconds) => ({ key: `${seconds}`, x: seconds * pixelsPerSecond }));
