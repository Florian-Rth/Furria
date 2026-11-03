import { partRangeOf, stepRangeOf } from '@furria/studio/music-timeline';
import { shownStepOf } from '@furria/studio/practice-stepping';
import type { StudioPart, StudioStep } from '@furria/studio/studio-schemas';
import type { TimelinePart, TimelineSpan } from '@furria/studio/Timeline';

export interface LessonStripLanes {
  parts: TimelinePart[];
  ticks: TimelineSpan[];
}

export const lessonStripOf = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
): LessonStripLanes => ({
  parts: parts.map((part, index) => ({
    key: part.partId,
    label: part.name,
    range: partRangeOf(part, steps),
    shade: index,
  })),
  ticks: steps.map((step) => ({ key: step.stepId, range: stepRangeOf(step) })),
});

export const stripStepIdOf = (steps: readonly StudioStep[], seconds: number): number | null =>
  shownStepOf(steps, seconds)?.stepId ?? null;
