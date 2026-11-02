import type { SpotPath } from '@furria/studio/choreography-motion';
import type { CountMark, TimelineRange } from '@furria/studio/music-timeline';
import type { StudioPart, StudioStep, StudioVideo } from '@furria/studio/studio-schemas';
import type { Studio } from '@/features/acts/schemas';

const SAME_PLACE_METRES = 0.05;
const COVER_SHARE = 0.5;
const COUNTS_PER_EIGHT = 8;

export type ScoreStepFlag = 'cutAway' | 'musicMissing';

export interface ScoreStepVideo {
  videoId: number;
  offsetSeconds: number;
}

export interface ScoreCounts {
  eights: number;
  rest: number;
}

export interface ScoreStep {
  stepId: number;
  number: number;
  name: string;
  description: string | null;
  range: TimelineRange | null;
  partId: number | null;
  partIndex: number | null;
  counts: ScoreCounts | null;
  movement: boolean;
  video: ScoreStepVideo | null;
  flag: ScoreStepFlag | null;
}

export interface ScorePart {
  partId: number;
  index: number;
  name: string;
  range: TimelineRange | null;
  stepIds: readonly number[];
}

export const stepRangeOf = (step: StudioStep): TimelineRange | null =>
  step.placement !== 'onTimeline' ||
  step.startSeconds === null ||
  step.endSeconds === null ||
  step.endSeconds <= step.startSeconds
    ? null
    : { start: step.startSeconds, end: step.endSeconds };

export const countsIn = (marks: readonly CountMark[], range: TimelineRange): ScoreCounts | null => {
  const beats = marks.filter((mark) => mark.seconds >= range.start && mark.seconds < range.end);

  return beats.length === 0
    ? null
    : {
        eights: Math.floor(beats.length / COUNTS_PER_EIGHT),
        rest: beats.length % COUNTS_PER_EIGHT,
      };
};

const isSamePlace = (
  left: { rightMetres: number; backMetres: number },
  right: { rightMetres: number; backMetres: number },
): boolean =>
  Math.abs(left.rightMetres - right.rightMetres) < SAME_PLACE_METRES &&
  Math.abs(left.backMetres - right.backMetres) < SAME_PLACE_METRES;

export const movesWithin = (paths: readonly SpotPath[], range: TimelineRange): boolean =>
  paths.some((path) =>
    path.keyframes.some((keyframe, index) => {
      const before = path.keyframes[index - 1];

      return (
        before !== undefined &&
        keyframe.seconds > range.start &&
        before.seconds < range.end &&
        (keyframe.bend !== null || !isSamePlace(before.position, keyframe.position))
      );
    }),
  );

const overlapOf = (video: StudioVideo, range: TimelineRange): number => {
  if (
    video.placement !== 'onTimeline' ||
    video.startSeconds === null ||
    video.durationSeconds === null ||
    video.state !== 'ready'
  ) {
    return 0;
  }

  const start = Math.max(range.start, video.startSeconds);
  const end = Math.min(range.end, video.startSeconds + video.durationSeconds);

  return Math.max(0, end - start) / (range.end - range.start);
};

export const coveringVideoOf = (
  videos: readonly StudioVideo[],
  range: TimelineRange,
  preferredVideoId: number | null,
): ScoreStepVideo | null => {
  const covering = videos
    .map((video) => ({ video, share: overlapOf(video, range) }))
    .filter((entry) => entry.share >= COVER_SHARE)
    .sort(
      (left, right) =>
        Number(right.video.videoId === preferredVideoId) -
          Number(left.video.videoId === preferredVideoId) || right.share - left.share,
    );
  const best = covering[0]?.video;

  return best === undefined
    ? null
    : {
        videoId: best.videoId,
        offsetSeconds: Math.max(0, range.start - (best.startSeconds ?? 0)),
      };
};

const flagOf = (step: StudioStep): ScoreStepFlag | null =>
  step.placement === 'onTimeline' ? null : step.placement;

const partStartOf = (part: StudioPart, steps: readonly StudioStep[]): number => {
  const starts = steps
    .filter((step) => part.stepIds.includes(step.stepId))
    .map(stepRangeOf)
    .filter((range) => range !== null)
    .map((range) => range.start);

  return starts.length === 0 ? Number.POSITIVE_INFINITY : Math.min(...starts);
};

export const scorePartsOf = (studio: Studio): ScorePart[] =>
  studio.parts
    .filter((part) => !part.adrift)
    .map((part) => ({ part, start: partStartOf(part, studio.steps) }))
    .sort((left, right) => left.start - right.start)
    .map(({ part }, index) => {
      const ranges = studio.steps
        .filter((step) => part.stepIds.includes(step.stepId))
        .map(stepRangeOf)
        .filter((range) => range !== null);

      return {
        partId: part.partId,
        index,
        name: part.name,
        range:
          ranges.length === 0
            ? null
            : {
                start: Math.min(...ranges.map((range) => range.start)),
                end: Math.max(...ranges.map((range) => range.end)),
              },
        stepIds: part.stepIds,
      };
    });

const stepOrder = (left: StudioStep, right: StudioStep): number =>
  (stepRangeOf(left)?.start ?? Number.POSITIVE_INFINITY) -
  (stepRangeOf(right)?.start ?? Number.POSITIVE_INFINITY);

export const scoreStepsOf = (
  studio: Studio,
  parts: readonly ScorePart[],
  paths: readonly SpotPath[],
  marks: readonly CountMark[],
): ScoreStep[] =>
  studio.steps.toSorted(stepOrder).map((step) => {
    const range = stepRangeOf(step);
    const part = parts.find((candidate) => candidate.stepIds.includes(step.stepId)) ?? null;
    const preferred =
      studio.parts.find((candidate) => candidate.partId === part?.partId)?.mainVideoId ?? null;
    const number = studio.steps.findIndex((candidate) => candidate.stepId === step.stepId) + 1;

    return {
      stepId: step.stepId,
      number,
      name: step.name,
      description: step.description,
      range,
      partId: part?.partId ?? null,
      partIndex: part?.index ?? null,
      counts: range === null ? null : countsIn(marks, range),
      movement: range !== null && movesWithin(paths, range),
      video: range === null ? null : coveringVideoOf(studio.videos, range, preferred),
      flag: flagOf(step),
    };
  });

export const stepAtSeconds = (steps: readonly ScoreStep[], seconds: number): ScoreStep | null =>
  steps.find(
    (step) => step.range !== null && seconds >= step.range.start && seconds < step.range.end,
  ) ?? null;

export interface ScoreStepGroup {
  part: ScorePart | null;
  steps: ScoreStep[];
}

export const stepGroupsOf = (
  steps: readonly ScoreStep[],
  parts: readonly ScorePart[],
): ScoreStepGroup[] => {
  const grouped = parts
    .map((part) => ({ part, steps: steps.filter((step) => step.partId === part.partId) }))
    .filter((group) => group.steps.length > 0);
  const loose = steps.filter((step) => step.partId === null);

  return loose.length === 0 ? grouped : [...grouped, { part: null, steps: loose }];
};
