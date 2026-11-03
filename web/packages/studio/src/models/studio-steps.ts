import type { CountMark } from '@furria/studio/music-timeline';
import { snappedOf } from '@furria/studio/studio-edits';
import type { StudioPart, StudioStep } from '@furria/studio/studio-schemas';

export interface StepTextInput {
  stepId: number;
  name: string;
  description: string | null;
}

export interface StepStartInput {
  stepId: number;
  atSeconds: number;
}

export interface PartOpening {
  firstStepId: number;
  name: string;
}

export interface PartSettings {
  name: string;
  firstStepId: number;
  mainVideoId: number | null;
}

export interface PartSettingsInput {
  partId: number;
  settings: PartSettings;
}

export type PartShift = 'earlier' | 'later';

export interface PartDeskAnchor {
  stepId: number;
  partId: number;
}

const BORDER_TOLERANCE_SECONDS = 0.01;

export const markSecondsOf = (
  timeline: { steps: readonly StudioStep[]; countMarks: readonly CountMark[] },
  seconds: number,
): number => {
  const free = timeline.countMarks.filter(
    (mark) =>
      !timeline.steps.some(
        (step) =>
          step.startSeconds !== null &&
          Math.abs(step.startSeconds - mark.seconds) < BORDER_TOLERANCE_SECONDS,
      ),
  );

  return snappedOf(free, seconds);
};

const timelineIdsOf = (steps: readonly StudioStep[]): number[] =>
  steps.filter((step) => step.startSeconds !== null).map((step) => step.stepId);

const firstStepOf = (part: StudioPart): number | null => part.stepIds[0] ?? null;

const placedPartsOf = (parts: readonly StudioPart[]): StudioPart[] =>
  parts.filter((part) => !part.adrift && part.stepIds.length > 0);

export const partSettingsOf = (part: StudioPart): PartSettings => ({
  name: part.name,
  firstStepId: firstStepOf(part) ?? 0,
  mainVideoId: part.mainVideoId,
});

export const partOfStep = (parts: readonly StudioPart[], stepId: number): StudioPart | null =>
  parts.find((part) => part.stepIds.includes(stepId)) ?? null;

export const deskPartOf = (
  parts: readonly StudioPart[],
  stepId: number,
  anchor: PartDeskAnchor | null,
): StudioPart | null =>
  (anchor?.stepId === stepId ? parts.find((part) => part.partId === anchor.partId) : undefined) ??
  partOfStep(parts, stepId);

export const startsAPart = (parts: readonly StudioPart[], stepId: number): boolean =>
  parts.some((part) => firstStepOf(part) === stepId);

export const partBorderStepOf = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
  partId: number,
  shift: PartShift,
): number | null => {
  const order = timelineIdsOf(steps);
  const placed = placedPartsOf(parts);
  const index = placed.findIndex((part) => part.partId === partId);
  const before = placed[index - 1];
  const part = placed[index];

  if (index <= 0 || before === undefined || part === undefined) {
    return null;
  }

  const lower = order.indexOf(firstStepOf(before) ?? -1);
  const after = placed[index + 1];
  const upper = after === undefined ? order.length : order.indexOf(firstStepOf(after) ?? -1);
  const target = order.indexOf(firstStepOf(part) ?? -1) + (shift === 'earlier' ? -1 : 1);

  return target > lower && target < upper ? (order[target] ?? null) : null;
};
