import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import { partOfStep } from '@/features/act-player/music-timeline';
import { shownStepNameOf } from '@/features/act-player/step-names';
import { isPlayableVideo } from '@/features/act-player/video-sync';
import type { StudioPart, StudioStep, StudioVideo } from '@/features/acts/schemas';

const COUNTS_PER_EIGHT = 8;
const EIGHT_GRAIN = 2;
const SECONDS_PER_MINUTE = 60;

export interface StepListRow {
  stepId: number;
  number: number;
  name: string;
  start: number;
  end: number;
  eights: number | null;
  filmed: boolean;
}

export interface StepListGroup {
  key: string;
  name: string | null;
  start: number;
  end: number;
  rows: StepListRow[];
}

export const clockOf = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE);
  const rest = whole % SECONDS_PER_MINUTE;

  return `${minutes}:${String(rest).padStart(2, '0')}`;
};

export const eightsOf = (marks: readonly CountMark[], range: TimelineRange): number | null => {
  if (marks.length === 0) {
    return null;
  }
  const counts = marks.filter(
    (mark) => mark.seconds >= range.start && mark.seconds < range.end,
  ).length;

  return Math.round((counts / COUNTS_PER_EIGHT) * EIGHT_GRAIN) / EIGHT_GRAIN;
};

export const isFilmed = (videos: readonly StudioVideo[], range: TimelineRange): boolean =>
  videos.some(
    (video) =>
      isPlayableVideo(video) &&
      video.startSeconds !== null &&
      video.durationSeconds !== null &&
      video.startSeconds < range.end &&
      video.startSeconds + video.durationSeconds > range.start,
  );

export const stepListOf = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
  videos: readonly StudioVideo[],
  marks: readonly CountMark[],
): StepListGroup[] => {
  const groups: StepListGroup[] = [];
  let number = 0;

  for (const step of steps) {
    if (step.startSeconds === null || step.endSeconds === null) {
      continue;
    }
    number += 1;
    const range = { start: step.startSeconds, end: step.endSeconds };
    const part = partOfStep(parts, step.stepId);
    const key = part === null ? `step-${step.stepId}` : `part-${part.partId}`;
    const row: StepListRow = {
      stepId: step.stepId,
      number,
      name: shownStepNameOf(step.name, number),
      start: range.start,
      end: range.end,
      eights: eightsOf(marks, range),
      filmed: isFilmed(videos, range),
    };
    const last = groups.at(-1);

    if (last !== undefined && last.key === key) {
      last.end = Math.max(last.end, range.end);
      last.rows.push(row);
    } else {
      groups.push({
        key,
        name: part?.name ?? null,
        start: range.start,
        end: range.end,
        rows: [row],
      });
    }
  }

  return groups;
};
