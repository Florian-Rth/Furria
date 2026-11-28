import type { SpotPath } from '@furria/studio/choreography-motion';
import type { TimelineRange } from '@furria/studio/music-timeline';
import { isStepOnTimeline } from '@furria/studio/music-timeline';
import type { StudioStep } from '@furria/studio/studio-schemas';

const BORDER_SECONDS = 0.02;

export interface TimedStep {
  stepId: number;
  name: string;
  start: number;
  end: number;
}

export const timedStepsOf = (steps: readonly StudioStep[]): TimedStep[] =>
  steps.filter(isStepOnTimeline).map((step) => ({
    stepId: step.stepId,
    name: step.name,
    start: step.startSeconds,
    end: step.endSeconds,
  }));

export interface SetupProgress {
  total: number;
  unnamed: number;
}

export type SetupOpen = 'nothing' | 'names';

export interface SetupResume {
  open: SetupOpen;
  count: number;
  total: number;
}

export const stepsInRangeOf = (steps: readonly TimedStep[], range: TimelineRange): TimedStep[] =>
  steps.filter(
    (step) => step.start < range.end - BORDER_SECONDS && step.end > range.start + BORDER_SECONDS,
  );

const keyedWithin = (paths: readonly SpotPath[], from: number, until: number): boolean =>
  paths.some((path) =>
    path.keyframes.some((keyframe) => keyframe.seconds >= from && keyframe.seconds < until),
  );

export const hasFormationOf = (paths: readonly SpotPath[], step: TimedStep): boolean =>
  keyedWithin(paths, step.start - BORDER_SECONDS, step.end - BORDER_SECONDS);

export const setupProgressOf = (steps: readonly TimedStep[]): SetupProgress => ({
  total: steps.length,
  unnamed: steps.filter((step) => step.name.trim() === '').length,
});

export const setupResumeOf = (progress: SetupProgress, hasVideo: boolean): SetupResume => {
  const { total } = progress;
  if (!hasVideo || total === 0) {
    return { open: 'nothing', count: 0, total };
  }
  if (progress.unnamed > 0) {
    return { open: 'names', count: progress.unnamed, total };
  }

  return { open: 'nothing', count: 0, total };
};
