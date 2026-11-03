import type { SpotPath } from '@furria/studio/choreography-motion';
import { spotPathsOf } from '@furria/studio/choreography-motion';
import type { CountMark, MusicSegment } from '@furria/studio/music-timeline';
import { countMarksOf, musicLengthOf, musicSegmentsOf } from '@furria/studio/music-timeline';
import type { FormationDot } from '@furria/studio/score-formation';
import { formationAt } from '@furria/studio/score-formation';
import type { ScorePart, ScoreStep, ScoreStepGroup } from '@furria/studio/score-steps';
import { scorePartsOf, scoreStepsOf, stepGroupsOf } from '@furria/studio/score-steps';
import { stageOrDefault } from '@furria/studio/stage-view';
import type { StudioStage } from '@furria/studio/studio-schemas';
import type { ActStudio } from '@/features/acts/schemas';
import type { ReadinessItem } from './score-readiness';
import { readinessOf } from './score-readiness';

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

const ownSpotIdOf = (studio: ActStudio, viewerId: number | null): number | null =>
  viewerId === null
    ? null
    : (studio.spots.find((spot) => spot.person?.personId === viewerId)?.spotId ?? null);

export const scoreModelOf = (studio: ActStudio, viewerId: number | null): ScoreModel => {
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
