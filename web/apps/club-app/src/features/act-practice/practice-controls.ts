import type { TimelineRange } from '@/features/act-player/music-timeline';
import { partOfStep, partRangeOf, stepRangeOf } from '@/features/act-player/music-timeline';
import { isPlayableVideo, videoSecondsAt } from '@/features/act-player/video-sync';
import type { StudioPart, StudioStep, StudioVideo } from '@/features/acts/schemas';
import { shownStepOf } from './practice-stepping';

export type LoopKind = 'off' | 'step' | 'part';
export type HeroKind = 'video' | 'stage';
export type TapZone = 'back' | 'middle' | 'forward';
export type Drag = 'none' | 'vertical' | 'horizontal';

const MIN_RATE = 0.5;
const MAX_RATE = 1;
const RATE_GRAIN = 0.05;
const RATE_PER_FULL_DRAG = 1;
const SIDE_ZONE_SHARE = 1 / 3;
const DRAG_THRESHOLD_PX = 14;

const sameRange = (left: TimelineRange | null, right: TimelineRange | null): boolean =>
  left !== null && right !== null && left.start === right.start && left.end === right.end;

const partRangeOfStep = (
  step: StudioStep,
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
): TimelineRange | null => {
  const part = partOfStep(parts, step.stepId);

  return part === null ? stepRangeOf(step) : partRangeOf(part, steps);
};

export const loopKindOf = (
  loop: TimelineRange | null,
  step: StudioStep | null,
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
): LoopKind => {
  if (loop === null) {
    return 'off';
  }
  if (step !== null && sameRange(loop, stepRangeOf(step))) {
    return 'step';
  }
  if (step !== null && sameRange(loop, partRangeOfStep(step, parts, steps))) {
    return 'part';
  }

  return 'step';
};

export const loopRangeOf = (
  kind: LoopKind,
  step: StudioStep | null,
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
): TimelineRange | null => {
  if (kind === 'off' || step === null) {
    return null;
  }

  return kind === 'step' ? stepRangeOf(step) : partRangeOfStep(step, parts, steps);
};

const overlaps = (video: StudioVideo, range: TimelineRange): boolean =>
  isPlayableVideo(video) &&
  video.startSeconds !== null &&
  video.durationSeconds !== null &&
  video.startSeconds < range.end &&
  video.startSeconds + video.durationSeconds > range.start;

const coversMoment = (video: StudioVideo, seconds: number): boolean =>
  videoSecondsAt(video, seconds) !== null;

const mainFirst = (videos: readonly StudioVideo[], mainId: number | null): StudioVideo[] => [
  ...videos.filter((video) => video.videoId === mainId),
  ...videos.filter((video) => video.videoId !== mainId),
];

export const partVideosOf = (
  videos: readonly StudioVideo[],
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
  seconds: number,
): StudioVideo[] => {
  const step = shownStepOf(steps, seconds);
  const mainId = step === null ? null : (partOfStep(parts, step.stepId)?.mainVideoId ?? null);
  const covering = videos.filter((video) => coversMoment(video, seconds));

  if (covering.length > 0) {
    return mainFirst(covering, mainId);
  }

  const range = step === null ? null : partRangeOfStep(step, parts, steps);

  return range === null
    ? []
    : mainFirst(
        videos.filter((video) => overlaps(video, range)),
        mainId,
      );
};

export const shownVideoIdOf = (
  choiceIds: readonly number[],
  chosenId: number | null,
): number | null =>
  chosenId !== null && choiceIds.includes(chosenId) ? chosenId : (choiceIds[0] ?? null);

export const nextVideoIdOf = (
  choiceIds: readonly number[],
  shownId: number | null,
): number | null => {
  const index = shownId === null ? -1 : choiceIds.indexOf(shownId);

  return choiceIds[(index + 1) % choiceIds.length] ?? null;
};

export const heroOf = (video: StudioVideo | null): HeroKind => (video === null ? 'stage' : 'video');

export const swipedRateOf = (rate: number, riseShare: number): number => {
  const raw = rate + riseShare * RATE_PER_FULL_DRAG;
  const grained = Math.round(raw / RATE_GRAIN) * RATE_GRAIN;

  return Math.min(MAX_RATE, Math.max(MIN_RATE, Number(grained.toFixed(2))));
};

export const tapZoneOf = (share: number): TapZone => {
  if (share < SIDE_ZONE_SHARE) {
    return 'back';
  }

  return share > 1 - SIDE_ZONE_SHARE ? 'forward' : 'middle';
};

export const dragOf = (dx: number, dy: number): Drag => {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < DRAG_THRESHOLD_PX) {
    return 'none';
  }

  return Math.abs(dy) > Math.abs(dx) ? 'vertical' : 'horizontal';
};

export interface SegmentStep {
  stepId: number;
  grow: number;
}

export interface SegmentGroup {
  key: string;
  name: string | null;
  grow: number;
  steps: SegmentStep[];
}

const lengthOf = (step: StudioStep): number =>
  Math.max(0, (step.endSeconds ?? 0) - (step.startSeconds ?? 0));

export const segmentGroupsOf = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
): SegmentGroup[] => {
  const groups: SegmentGroup[] = [];

  for (const step of steps) {
    if (step.startSeconds === null || step.endSeconds === null) {
      continue;
    }
    const part = partOfStep(parts, step.stepId);
    const key = part === null ? `step-${step.stepId}` : `part-${part.partId}`;
    const segment = { stepId: step.stepId, grow: lengthOf(step) };
    const last = groups.at(-1);

    if (last !== undefined && last.key === key) {
      last.grow += segment.grow;
      last.steps.push(segment);
    } else {
      groups.push({ key, name: part?.name ?? null, grow: segment.grow, steps: [segment] });
    }
  }

  return groups;
};

export const fillOf = (step: StudioStep, seconds: number): number => {
  const start = step.startSeconds ?? 0;
  const length = lengthOf(step);

  if (length <= 0) {
    return seconds >= start ? 1 : 0;
  }

  return Math.min(1, Math.max(0, (seconds - start) / length));
};

export const isLooped = (step: StudioStep, loop: TimelineRange | null): boolean =>
  loop !== null &&
  step.startSeconds !== null &&
  step.endSeconds !== null &&
  step.startSeconds >= loop.start &&
  step.endSeconds <= loop.end;
