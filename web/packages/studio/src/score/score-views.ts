import { partAnchorOf } from '@furria/studio/score-anchor';
import {
  countsTextOf,
  flagTextOf,
  glyphsLabelOf,
  LOOSE_STEPS,
  partHintOf,
  partRangeTextOf,
  practiseMetaOf,
  rangeTextOf,
  stepContextOf,
  stepTitleOf,
} from '@furria/studio/score-copy';
import { enteringDotsOf, entranceDelayOf } from '@furria/studio/score-entrance';
import type { FormationDot, ScoreDot } from '@furria/studio/score-formation';
import type { ScoreModel } from '@furria/studio/score-model';
import type { ScoreStep } from '@furria/studio/score-steps';
import type { Studio } from '@furria/studio/studio-schemas';
import type { TimelinePart, TimelineStep } from '@furria/studio/Timeline';

export interface ScoreRowView {
  stepId: number;
  label: string;
  number: number;
  title: string;
  meta: string;
  dots: ScoreDot[];
  entranceDelay: number | null;
  movement: boolean;
  video: boolean;
  flag: string | null;
}

export interface ScoreGroupView {
  key: number;
  anchor: string | undefined;
  title: string;
  meta: string;
  shade: number | null;
  rows: ScoreRowView[];
}

export interface ScoreStepView {
  step: ScoreStep;
  title: string;
  context: string;
  dots: ScoreDot[];
  videoSource: string | null;
  videoPoster: string | null;
  videoName: string | null;
}

export interface ScoreYouView {
  place: number | null;
  dots: ScoreDot[];
  practiseMeta: string | null;
}

const shownDotOf = (dot: FormationDot): ScoreDot => ({
  id: dot.spotId,
  x: dot.x,
  y: dot.y,
  own: dot.own,
  open: dot.open,
  number: dot.number,
  caption: dot.firstName,
});

const shownDotsOf = (dots: readonly FormationDot[]): ScoreDot[] => dots.map(shownDotOf);

const stepLabelOf = (step: ScoreStep): string =>
  [
    `${step.number}. ${stepTitleOf(step.number, step.name)}`,
    rangeTextOf(step.range),
    glyphsLabelOf(step.movement, step.video !== null, step.flag),
  ]
    .filter((piece) => piece !== '')
    .join(', ');

const formationOf = (model: ScoreModel, stepId: number): FormationDot[] =>
  model.formations.get(stepId) ?? [];

export const timedStepsOf = (model: ScoreModel): ScoreStep[] =>
  model.steps.filter((step) => step.range !== null);

const rowOf = (
  step: ScoreStep,
  model: ScoreModel,
  before: readonly FormationDot[] | null,
  entranceDelay: number | null,
): ScoreRowView => ({
  stepId: step.stepId,
  label: stepLabelOf(step),
  number: step.number,
  title: stepTitleOf(step.number, step.name),
  meta: [rangeTextOf(step.range), countsTextOf(step.counts)]
    .filter((piece) => piece !== '')
    .join(' · '),
  dots: enteringDotsOf(formationOf(model, step.stepId), before).map((dot) => ({
    ...shownDotOf(dot),
    fromX: dot.fromX,
    fromY: dot.fromY,
  })),
  entranceDelay,
  movement: step.movement,
  video: step.video !== null,
  flag: step.flag === null ? null : flagTextOf(step.flag),
});

export const scoreGroupsOf = (model: ScoreModel, reveal: boolean): ScoreGroupView[] => {
  let index = 0;
  let before: readonly FormationDot[] | null = null;

  return model.groups.map((group) => ({
    key: group.part?.partId ?? 0,
    anchor: group.part === null ? undefined : partAnchorOf(group.part.partId),
    title: group.part?.name ?? LOOSE_STEPS,
    meta: partRangeTextOf(group.part?.range ?? null, group.steps.length),
    shade: group.part?.index ?? null,
    rows: group.steps.map((step) => {
      const row = rowOf(step, model, before, reveal ? entranceDelayOf(index) : null);
      const dots = formationOf(model, step.stepId);
      before = dots.length === 0 ? before : dots;
      index += 1;

      return row;
    }),
  }));
};

export const scoreStepViewOf = (
  step: ScoreStep,
  model: ScoreModel,
  studio: Studio,
): ScoreStepView => {
  const part = model.parts.find((candidate) => candidate.partId === step.partId) ?? null;
  const videoId = step.video?.videoId ?? null;
  const video =
    videoId === null ? undefined : studio.videos.find((candidate) => candidate.videoId === videoId);

  return {
    step,
    title: `${step.number} · ${stepTitleOf(step.number, step.name)}`,
    context: stepContextOf(rangeTextOf(step.range), countsTextOf(step.counts), part?.name ?? null),
    dots: shownDotsOf(formationOf(model, step.stepId)),
    videoSource: video?.urls.compact ?? null,
    videoPoster: video?.urls.poster ?? null,
    videoName: video?.name ?? null,
  };
};

export interface ScorePlace {
  spotId: number;
  number: number;
}

export const scoreYouOf = (
  model: ScoreModel,
  spots: readonly ScorePlace[],
  remembered: ScoreStep | null,
): ScoreYouView => {
  const opening = timedStepsOf(model)[0];

  return {
    place: spots.find((spot) => spot.spotId === model.ownSpotId)?.number ?? null,
    dots: opening === undefined ? [] : shownDotsOf(formationOf(model, opening.stepId)),
    practiseMeta: remembered === null ? null : practiseMetaOf(remembered.number, remembered.name),
  };
};

export const timelinePartsOf = (model: ScoreModel): TimelinePart[] =>
  model.parts.map((part) => ({
    key: part.partId,
    label: part.name,
    hint: partHintOf(part.name),
    range: part.range,
    shade: part.index,
  }));

export const timelineStepsOf = (model: ScoreModel): TimelineStep[] =>
  timedStepsOf(model).map((step) => ({
    key: step.stepId,
    number: step.number,
    name: stepTitleOf(step.number, step.name),
    label: stepLabelOf(step),
    range: step.range,
    movement: step.movement,
    video: step.video !== null,
  }));
