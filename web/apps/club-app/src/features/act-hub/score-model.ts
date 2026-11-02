import type { SpotPath } from '@furria/studio/choreography-motion';
import { spotPathsOf } from '@furria/studio/choreography-motion';
import type { CountMark, MusicSegment } from '@furria/studio/music-timeline';
import { countMarksOf, musicLengthOf, musicSegmentsOf } from '@furria/studio/music-timeline';
import { stageOrDefault } from '@furria/studio/stage-view';
import type { StudioStage } from '@furria/studio/studio-schemas';
import type { Studio } from '@/features/acts/schemas';
import type { FormationDot } from './score-formation';
import { formationAt } from './score-formation';
import type { ReadinessItem } from './score-readiness';
import { readinessOf } from './score-readiness';
import type { ScorePart, ScoreStep, ScoreStepGroup } from './score-steps';
import { scorePartsOf, scoreStepsOf, stepGroupsOf } from './score-steps';

export interface ScoreModel {
  segments: readonly MusicSegment[];
  length: number;
  marks: CountMark[];
  paths: readonly SpotPath[];
  parts: ScorePart[];
  steps: ScoreStep[];
  groups: ScoreStepGroup[];
  readiness: ReadinessItem[];
  stage: StudioStage;
  ownSpotId: number | null;
  formations: ReadonlyMap<number, FormationDot[]>;
}

const ownSpotIdOf = (studio: Studio, viewerId: number | null): number | null =>
  viewerId === null
    ? null
    : (studio.spots.find((spot) => spot.person?.personId === viewerId)?.spotId ?? null);

export const scoreModelOf = (studio: Studio, viewerId: number | null): ScoreModel => {
  const segments = musicSegmentsOf(studio);
  const length = musicLengthOf(segments);
  const marks = countMarksOf(segments);
  const paths = spotPathsOf(studio.choreography, segments);
  const parts = scorePartsOf(studio);
  const steps = scoreStepsOf(studio, parts, paths, marks);
  const stage = stageOrDefault(studio.stage);
  const ownSpotId = ownSpotIdOf(studio, viewerId);

  return {
    segments,
    length,
    marks,
    paths,
    parts,
    steps,
    groups: stepGroupsOf(steps, parts),
    readiness: readinessOf(studio, steps),
    stage,
    ownSpotId,
    formations: new Map(
      steps.map((step) => [
        step.stepId,
        step.range === null
          ? []
          : formationAt(paths, studio.spots, stage, step.range.start, ownSpotId),
      ]),
    ),
  };
};
