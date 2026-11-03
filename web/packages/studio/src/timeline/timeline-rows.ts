import type { SpotPath } from '@furria/studio/choreography-motion';
import type { CountMark } from '@furria/studio/music-timeline';
import { glyphsLabelOf, partHintOf, rangeTextOf, stepTitleOf } from '@furria/studio/score-copy';
import type { ScorePart, ScoreStep } from '@furria/studio/score-steps';
import { scorePartsOf, scoreStepsOf } from '@furria/studio/score-steps';
import type { Studio } from '@furria/studio/studio-schemas';
import type { TimelinePart, TimelineStep } from '@furria/studio/Timeline';

export interface TimelineRows {
  parts: TimelinePart[];
  steps: TimelineStep[];
}

export const stepRowLabelOf = (step: ScoreStep): string =>
  [
    `${step.number}. ${stepTitleOf(step.number, step.name)}`,
    rangeTextOf(step.range),
    glyphsLabelOf(step.movement, step.video !== null, step.flag),
  ]
    .filter((piece) => piece !== '')
    .join(', ');

export const partRowsOf = (
  parts: readonly ScorePart[],
  currentStepId: number | null = null,
  selectedPartId: number | null = null,
): TimelinePart[] =>
  parts.map((part) => ({
    key: part.partId,
    label: part.name,
    hint: partHintOf(part.name),
    range: part.range,
    shade: part.index,
    current: currentStepId !== null && part.stepIds.includes(currentStepId),
    selected: part.partId === selectedPartId,
  }));

export const stepRowsOf = (steps: readonly ScoreStep[]): TimelineStep[] =>
  steps.flatMap((step) =>
    step.range === null
      ? []
      : [
          {
            key: step.stepId,
            number: step.number,
            name: stepTitleOf(step.number, step.name),
            label: stepRowLabelOf(step),
            range: step.range,
            movement: step.movement,
            video: step.video !== null,
          },
        ],
  );

export const timelineRowsOf = (
  studio: Studio,
  paths: readonly SpotPath[],
  marks: readonly CountMark[],
  currentStepId: number | null,
  selectedPartId: number | null = null,
): TimelineRows => {
  const parts = scorePartsOf(studio);

  return {
    parts: partRowsOf(parts, currentStepId, selectedPartId),
    steps: stepRowsOf(scoreStepsOf(studio, parts, paths, marks)),
  };
};
