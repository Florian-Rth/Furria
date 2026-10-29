import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import { partOfStep, stepAt, stepRangeOf } from '@/features/act-player/music-timeline';
import { isPlayableVideo, videoAt } from '@/features/act-player/video-sync';
import type { StudioPart, StudioStep, StudioVideo } from '@/features/acts/schemas';

const LEAD_IN_SECONDS = 4;
const SECONDS_PER_MINUTE = 60;
const CLOCK_PAD = 2;
const PERCENT = 100;

export const STUDIO_D_RATES = [1, 0.9, 0.8, 0.7, 0.6, 0.5] as const;

export type StudioDPicture = 'video' | 'stage';

export interface StudioDFraming {
  full: StudioDPicture;
  inset: StudioDPicture | null;
}

export interface StudioDStepMark {
  stepId: number;
  at: number;
  opensPart: boolean;
}

export interface StudioDShare {
  start: number;
  end: number;
}

export type StudioDSurfaceTap = 'wake' | 'sleep' | 'none';

export interface StudioDControlsMoment {
  playing: boolean;
  awake: boolean;
  holding: boolean;
}

export interface StudioDStepEntry {
  stepId: number;
  name: string;
  description: string | null;
  startSeconds: number;
}

export interface StudioDStepGroup {
  key: string;
  name: string | null;
  steps: StudioDStepEntry[];
}

export const practiceStepOf = (steps: readonly StudioStep[], seconds: number): StudioStep | null =>
  stepAt(steps, seconds) ??
  steps.find((step) => (step.startSeconds ?? 0) > seconds) ??
  steps.at(-1) ??
  null;

const leadInVideoOf = (
  videos: readonly StudioVideo[],
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
  seconds: number,
): StudioVideo | null => {
  const step = practiceStepOf(steps, seconds);
  const part = step === null ? null : partOfStep(parts, step.stepId);
  const main = videos.find((video) => video.videoId === part?.mainVideoId);

  if (main === undefined || !isPlayableVideo(main) || main.startSeconds === null) {
    return null;
  }

  const ahead = main.startSeconds - seconds;

  return ahead > 0 && ahead <= LEAD_IN_SECONDS ? main : null;
};

export const heroVideoOf = (
  videos: readonly StudioVideo[],
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
  seconds: number,
): StudioVideo | null =>
  videoAt(videos, parts, steps, seconds) ?? leadInVideoOf(videos, parts, steps, seconds);

export const framingOf = (hasVideo: boolean, stageFirst: boolean): StudioDFraming => {
  if (!hasVideo) {
    return { full: 'stage', inset: null };
  }

  return stageFirst ? { full: 'stage', inset: 'video' } : { full: 'video', inset: 'stage' };
};

const shareOf = (seconds: number, length: number): number =>
  length <= 0 ? 0 : Math.min(Math.max(seconds / length, 0), 1);

export const stepMarksOf = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
  length: number,
): StudioDStepMark[] =>
  steps.flatMap((step, index) => {
    if (step.startSeconds === null || index === 0) {
      return [];
    }

    const part = partOfStep(parts, step.stepId);
    const before = steps[index - 1];
    const previousPart = before === undefined ? null : partOfStep(parts, before.stepId);

    return [
      {
        stepId: step.stepId,
        at: shareOf(step.startSeconds, length),
        opensPart: part?.partId !== previousPart?.partId,
      },
    ];
  });

export const loopShareOf = (loop: TimelineRange | null, length: number): StudioDShare | null =>
  loop === null ? null : { start: shareOf(loop.start, length), end: shareOf(loop.end, length) };

export const loopedStepIdOf = (
  loop: TimelineRange | null,
  steps: readonly StudioStep[],
): number | null => {
  if (loop === null) {
    return null;
  }

  const looped = steps.find((step) => {
    const range = stepRangeOf(step);
    return range !== null && range.start === loop.start && range.end === loop.end;
  });

  return looped?.stepId ?? null;
};

export const releasesLoop = (loop: TimelineRange | null, seconds: number): boolean =>
  loop !== null && (seconds < loop.start || seconds >= loop.end);

export const controlsShownOf = (moment: StudioDControlsMoment): boolean =>
  !moment.playing || moment.awake || moment.holding;

export const surfaceTapOf = (shown: boolean, playing: boolean): StudioDSurfaceTap => {
  if (!playing) {
    return 'none';
  }

  return shown ? 'sleep' : 'wake';
};

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

export const stepGroupsOf = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
): StudioDStepGroup[] => {
  const groups: StudioDStepGroup[] = [];

  for (const step of steps) {
    if (step.startSeconds === null) {
      continue;
    }

    const part = partOfStep(parts, step.stepId);
    const key = part === null ? 'loose' : `part-${part.partId}`;
    const entry = {
      stepId: step.stepId,
      name: step.name,
      description: step.description,
      startSeconds: step.startSeconds,
    };
    const last = groups.at(-1);

    if (last !== undefined && last.key === key) {
      last.steps.push(entry);
    } else {
      groups.push({ key, name: part?.name ?? null, steps: [entry] });
    }
  }

  return groups;
};

export const clockOf = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE);
  const rest = String(whole % SECONDS_PER_MINUTE).padStart(CLOCK_PAD, '0');

  return `${minutes}:${rest}`;
};

export const ratePercentOf = (rate: number): string => `${Math.round(rate * PERCENT)} %`;
