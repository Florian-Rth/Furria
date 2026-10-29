import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import { partOfStep, partRangeOf, stepAt, stepRangeOf } from '@/features/act-player/music-timeline';
import { isPlayableVideo, videoAt } from '@/features/act-player/video-sync';
import type { StudioPart, StudioStep, StudioVideo } from '@/features/acts/schemas';

const COUNTS_PER_EIGHT = 8;
const FIRST_COUNT = 1;

export type StudioALoopKind = 'step' | 'part' | 'free';

export interface StudioABeat {
  count: number;
  eight: number | null;
  eights: number | null;
}

export type StudioALength =
  | { kind: 'eights'; eights: number }
  | { kind: 'counts'; counts: number }
  | { kind: 'seconds'; seconds: number };

export const practiceStepOf = (steps: readonly StudioStep[], seconds: number): StudioStep | null =>
  stepAt(steps, seconds) ??
  steps.find((step) => (step.startSeconds ?? 0) > seconds) ??
  steps.at(-1) ??
  null;

const sameRange = (left: TimelineRange, right: TimelineRange | null): boolean =>
  right !== null && left.start === right.start && left.end === right.end;

export const loopKindOf = (
  loop: TimelineRange | null,
  step: StudioStep | null,
  part: StudioPart | null,
  steps: readonly StudioStep[],
): StudioALoopKind | null => {
  if (loop === null) {
    return null;
  }
  if (step !== null && sameRange(loop, stepRangeOf(step))) {
    return 'step';
  }
  if (part !== null && sameRange(loop, partRangeOf(part, steps))) {
    return 'part';
  }

  return 'free';
};

export const loopedPartIdOf = (
  loop: TimelineRange | null,
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
): number | null =>
  loop === null
    ? null
    : (parts.find((part) => sameRange(loop, partRangeOf(part, steps)))?.partId ?? null);

export const loopedStepIdOf = (
  loop: TimelineRange | null,
  steps: readonly StudioStep[],
): number | null =>
  loop === null ? null : (steps.find((step) => sameRange(loop, stepRangeOf(step)))?.stepId ?? null);

export const beatIndexAt = (marks: readonly CountMark[], seconds: number): number => {
  let low = 0;
  let high = marks.length - 1;
  let found = -1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const mark = marks[middle];

    if (mark !== undefined && mark.seconds <= seconds) {
      found = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return found;
};

const firstCountsIn = (marks: readonly CountMark[], range: TimelineRange): CountMark[] =>
  marks.filter(
    (mark) => mark.count === FIRST_COUNT && mark.seconds >= range.start && mark.seconds < range.end,
  );

export const beatOf = (
  marks: readonly CountMark[],
  index: number,
  step: StudioStep | null,
): StudioABeat | null => {
  const mark = marks[index];

  if (mark === undefined) {
    return null;
  }

  const range = step === null ? null : stepRangeOf(step);

  if (range === null || mark.seconds < range.start || mark.seconds >= range.end) {
    return { count: mark.count, eight: null, eights: null };
  }

  const firsts = firstCountsIn(marks, range);
  const eight = firsts.filter((first) => first.seconds <= mark.seconds).length;

  return {
    count: mark.count,
    eight: eight === 0 ? null : eight,
    eights: firsts.length === 0 ? null : firsts.length,
  };
};

export const stepLengthOf = (
  marks: readonly CountMark[],
  step: StudioStep,
): StudioALength | null => {
  const range = stepRangeOf(step);

  if (range === null) {
    return null;
  }

  const counts = marks.filter(
    (mark) => mark.seconds >= range.start && mark.seconds < range.end,
  ).length;

  if (counts === 0) {
    return { kind: 'seconds', seconds: range.end - range.start };
  }

  return counts % COUNTS_PER_EIGHT === 0
    ? { kind: 'eights', eights: counts / COUNTS_PER_EIGHT }
    : { kind: 'counts', counts };
};

export const framedVideoOf = (
  videos: readonly StudioVideo[],
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
  seconds: number,
): StudioVideo | null => {
  const playing = videoAt(videos, parts, steps, seconds);

  if (playing !== null) {
    return playing;
  }

  const step = practiceStepOf(steps, seconds);
  const part = step === null ? null : partOfStep(parts, step.stepId);
  const main = videos.find((video) => video.videoId === part?.mainVideoId);

  return main !== undefined && isPlayableVideo(main) ? main : null;
};
