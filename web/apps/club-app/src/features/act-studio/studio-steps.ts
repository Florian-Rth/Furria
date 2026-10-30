import type { CountMark } from '@/features/act-player/music-timeline';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';
import { snappedOf } from './studio-edits';
import type { HoldsStudio } from './studio-music';
import { withStudio } from './studio-music';

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

export const regroupedPartsOf = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
  starts: ReadonlyMap<number, number>,
): StudioPart[] => {
  const order = timelineIdsOf(steps);
  const placed = placedPartsOf(parts);
  const firstIndexes = placed.map((part, index) =>
    index === 0 ? 0 : order.indexOf(starts.get(part.partId) ?? firstStepOf(part) ?? -1),
  );
  const regrouped = new Map(
    placed.map((part, index) => [
      part.partId,
      order.slice(firstIndexes[index], firstIndexes[index + 1] ?? order.length),
    ]),
  );

  return parts.map((part) => {
    const stepIds = regrouped.get(part.partId);

    return stepIds === undefined ? part : { ...part, stepIds };
  });
};

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

export const withStepText = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  { stepId, name, description }: StepTextInput,
): TResponse | undefined =>
  withStudio(response, (studio) => ({
    ...studio,
    steps: studio.steps.map((step) =>
      step.stepId === stepId ? { ...step, name, description } : step,
    ),
  }));

export const withStepStart = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  { stepId, atSeconds }: StepStartInput,
): TResponse | undefined =>
  withStudio(response, (studio) => {
    const index = studio.steps.findIndex((step) => step.stepId === stepId);

    return {
      ...studio,
      steps: studio.steps.map((step, at) => {
        if (at === index) {
          return { ...step, startSeconds: atSeconds };
        }

        return at === index - 1 ? { ...step, endSeconds: atSeconds } : step;
      }),
    };
  });

export const withoutStep = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  stepId: number,
): TResponse | undefined =>
  withStudio(response, (studio) => {
    const order = timelineIdsOf(studio.steps);
    const index = order.indexOf(stepId);
    const removed = studio.steps.find((step) => step.stepId === stepId);
    const heirId = index > 0 ? order[index - 1] : order[index + 1];
    const steps = studio.steps.map((step) => {
      if (removed === undefined || index < 0 || step.stepId !== heirId) {
        return step;
      }

      return index > 0
        ? { ...step, endSeconds: removed.endSeconds }
        : { ...step, startSeconds: removed.startSeconds };
    });

    return {
      ...studio,
      steps: steps.filter((step) => step.stepId !== stepId),
      parts: studio.parts
        .map((part) => ({ ...part, stepIds: part.stepIds.filter((id) => id !== stepId) }))
        .filter((part) => part.adrift || part.stepIds.length > 0),
    };
  });

export const withPartSettings = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  { partId, settings }: PartSettingsInput,
): TResponse | undefined =>
  withStudio(response, (studio) => {
    const renamed = studio.parts.map((part) =>
      part.partId === partId
        ? { ...part, name: settings.name, mainVideoId: settings.mainVideoId }
        : part,
    );

    return {
      ...studio,
      parts: regroupedPartsOf(studio.steps, renamed, new Map([[partId, settings.firstStepId]])),
    };
  });

export const withoutPart = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  partId: number,
): TResponse | undefined =>
  withStudio(response, (studio) => {
    const parts = studio.parts.filter((part) => part.partId !== partId);

    return { ...studio, parts: regroupedPartsOf(studio.steps, parts, new Map()) };
  });
