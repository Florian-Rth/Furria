import type { TimelineRange } from '@/features/act-player/music-timeline';
import { partRangeOf } from '@/features/act-player/music-timeline';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';

export interface StudioAManualStep {
  step: StudioStep;
  number: number;
}

export type StudioAManualGroup =
  | { kind: 'part'; part: StudioPart; range: TimelineRange | null; steps: StudioAManualStep[] }
  | { kind: 'loose'; steps: StudioAManualStep[] }
  | { kind: 'cutAway'; steps: StudioAManualStep[] };

export interface StudioABand {
  partId: number;
  name: string;
  from: number;
  to: number;
}

const startOf = (range: TimelineRange | null): number => range?.start ?? Number.POSITIVE_INFINITY;

export const manualOf = (
  allSteps: readonly StudioStep[],
  timedSteps: readonly StudioStep[],
  parts: readonly StudioPart[],
): StudioAManualGroup[] => {
  const numbered = timedSteps.map((step, index) => ({ step, number: index + 1 }));
  const partGroups = parts
    .map((part) => ({
      kind: 'part' as const,
      part,
      range: partRangeOf(part, timedSteps),
      steps: numbered.filter((entry) => part.stepIds.includes(entry.step.stepId)),
    }))
    .filter((group) => group.steps.length > 0)
    .sort((left, right) => startOf(left.range) - startOf(right.range));
  const loose = numbered.filter(
    (entry) => !parts.some((part) => part.stepIds.includes(entry.step.stepId)),
  );
  const cutAway = allSteps
    .filter((step) => !timedSteps.includes(step))
    .map((step) => ({ step, number: 0 }));
  const groups: StudioAManualGroup[] = [...partGroups];

  if (loose.length > 0) {
    groups.push({ kind: 'loose', steps: loose });
  }
  if (cutAway.length > 0) {
    groups.push({ kind: 'cutAway', steps: cutAway });
  }

  return groups;
};

export const bandsOf = (
  parts: readonly StudioPart[],
  timedSteps: readonly StudioStep[],
  length: number,
): StudioABand[] =>
  length <= 0
    ? []
    : parts.flatMap((part) => {
        const range = partRangeOf(part, timedSteps);

        return range === null
          ? []
          : [
              {
                partId: part.partId,
                name: part.name,
                from: range.start / length,
                to: range.end / length,
              },
            ];
      });
