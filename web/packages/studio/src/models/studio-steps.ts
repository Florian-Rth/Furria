import type { CountMark } from '@furria/studio/music-timeline';
import { snappedOf } from '@furria/studio/studio-edits';
import type { StudioPart, StudioStep } from '@furria/studio/studio-schemas';

export interface StepNameInput {
  stepId: number;
  name: string;
}

export interface StepStartInput {
  stepId: number;
  atSeconds: number;
}

export interface PartOpening {
  firstStepId: number;
  lastStepId: number;
  name: string;
}

export interface PartSettings {
  name: string;
  firstStepId: number;
  lastStepId: number;
  mainVideoId: number | null;
}

export interface PartRange {
  partId: number;
  firstStepId: number;
  lastStepId: number;
}

export interface NewPartRange {
  firstStepId: number;
  lastStepId: number;
  shrink: PartRange | null;
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
  firstStepId: firstStepOf(part) ?? part.firstStepId,
  lastStepId: part.stepIds.at(-1) ?? part.lastStepId,
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

interface PartNeighbours {
  order: number[];
  part: StudioPart | null;
  before: StudioPart | null;
}

const neighboursOf = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
  partId: number,
): PartNeighbours => {
  const order = timelineIdsOf(steps);
  const placed = placedPartsOf(parts).sort(
    (left, right) =>
      order.indexOf(firstStepOf(left) ?? -1) - order.indexOf(firstStepOf(right) ?? -1),
  );
  const index = placed.findIndex((part) => part.partId === partId);
  const part = placed[index] ?? null;
  const before = placed[index - 1];
  const touches =
    before !== undefined &&
    part !== null &&
    order.indexOf(before.stepIds.at(-1) ?? -1) === order.indexOf(firstStepOf(part) ?? -1) - 1;

  return { order, part, before: touches ? before : null };
};

const rangeOfPart = (part: StudioPart, firstStepId: number, lastStepId: number): PartRange => ({
  partId: part.partId,
  firstStepId,
  lastStepId,
});

export const partShiftOf = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
  partId: number,
  shift: PartShift,
): PartRange[] | null => {
  const { order, part, before } = neighboursOf(steps, parts, partId);
  const first = part === null ? null : firstStepOf(part);
  const last = part?.stepIds.at(-1) ?? null;
  if (part === null || first === null || last === null) {
    return null;
  }
  const at = order.indexOf(first);

  if (shift === 'later') {
    const next = order[at + 1];
    if (next === undefined || first === last) {
      return null;
    }
    const grown = before === null ? [] : [rangeOfPart(before, firstStepOf(before) ?? first, first)];
    return [rangeOfPart(part, next, last), ...grown];
  }

  const previous = order[at - 1];
  if (previous === undefined) {
    return null;
  }
  if (before === null) {
    return [rangeOfPart(part, previous, last)];
  }
  const beforeFirst = firstStepOf(before);
  if (beforeFirst === null || beforeFirst === previous) {
    return null;
  }

  return [
    rangeOfPart(before, beforeFirst, order[at - 2] ?? beforeFirst),
    rangeOfPart(part, previous, last),
  ];
};

export const newPartOf = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
  stepId: number,
): NewPartRange | null => {
  const order = timelineIdsOf(steps);
  const at = order.indexOf(stepId);
  if (at < 0 || startsAPart(parts, stepId)) {
    return null;
  }
  const own = partOfStep(parts, stepId);
  const ownFirst = own === null ? null : firstStepOf(own);
  const ownLast = own?.stepIds.at(-1) ?? null;
  const previous = order[at - 1];
  if (own !== null && ownFirst !== null && ownLast !== null && previous !== undefined) {
    return {
      firstStepId: stepId,
      lastStepId: ownLast,
      shrink: rangeOfPart(own, ownFirst, previous),
    };
  }
  const grouped = new Set(placedPartsOf(parts).flatMap((part) => part.stepIds));
  const run = order.slice(at).findIndex((candidate) => grouped.has(candidate));
  const lastStepId = order[(run < 0 ? order.length : at + run) - 1] ?? stepId;

  return { firstStepId: stepId, lastStepId, shrink: null };
};
