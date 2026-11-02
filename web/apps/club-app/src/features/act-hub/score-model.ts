import type { SpotPath } from '@furria/studio/choreography-motion';
import { spotPathsOf } from '@furria/studio/choreography-motion';
import type { MusicSegment } from '@furria/studio/music-timeline';
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

const FIRST_COUNT = 1;

export interface ScoreModel {
  segments: readonly MusicSegment[];
  length: number;
  seams: number[];
  eights: number[];
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
  const shareOf = (seconds: number): number => (length > 0 ? seconds / length : 0);

  return {
    segments,
    length,
    seams: segments.slice(1).map((segment) => shareOf(segment.timelineStart)),
    eights: marks.filter((mark) => mark.count === FIRST_COUNT).map((mark) => shareOf(mark.seconds)),
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
