import type { StagePoint } from '@furria/studio/choreography-motion';
import { countsBetweenOf } from '@furria/studio/count-marks';
import { clockOf } from '@furria/studio/desk-copy';
import { eightsTextOf } from '@furria/studio/job-copy';
import type { ViewShare } from '@furria/studio/practice-stage';
import { viewShareOf } from '@furria/studio/practice-stage';
import type { TimedStep } from '@furria/studio/setup-progress';
import { hasFormationOf } from '@furria/studio/setup-progress';
import type { PartRange, StepGroup } from '@furria/studio/step-list';
import { stepGroupsOf } from '@furria/studio/step-list';
import { shownStepNameOf } from '@furria/studio/step-names';
import {
  secondsLengthOf,
  stepListPartMetaOf,
  stepListRowMetaOf,
} from '@furria/studio/step-setup-copy';
import { formationAt } from '@furria/studio/studio-formation';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { clipSpanOf } from '@furria/studio/studio-videos';
import type { JobConfirm } from '@furria/studio/use-job-confirm';
import type { PartMoves } from '@furria/studio/use-part-moves';
import type { Dispatch, SetStateAction } from 'react';

export interface StepFormation {
  before: ViewShare[];
  after: ViewShare[];
}

export interface StepListRow {
  stepId: number;
  number: number;
  name: string;
  meta: string;
  poster: string | null;
  formation: StepFormation | null;
  selected: boolean;
  press: () => void;
}

export interface StepListPart {
  range: PartRange;
  meta: string;
  selected: boolean;
  press: () => void;
}

export interface StepListRows {
  groups: StepGroup<StepListRow>[];
  parts: ReadonlyMap<number, StepListPart>;
}

const pointsOf = (points: ReadonlyMap<number, StagePoint>, screen: StudioScreen): ViewShare[] =>
  [...points.values()].map((point) => viewShareOf(point, screen.playback.stage));

export const useStepListRows = (
  screen: StudioScreen,
  timed: readonly TimedStep[],
  moves: PartMoves,
  partId: number | null,
  choosePart: Dispatch<SetStateAction<number | null>>,
  confirm: JobConfirm,
): StepListRows => {
  const { playback, practice, studio } = screen;
  const { paths, countMarks } = playback;
  const currentId = practice.step?.stepId ?? null;
  const readyVideos = studio.videos.filter((video) => video.state === 'ready');
  const posterAt = (seconds: number): string | null => {
    const video = readyVideos.find((candidate) => {
      const span = clipSpanOf(candidate);
      return span !== null && span.start <= seconds && span.end > seconds;
    });
    return video?.urls.poster ?? null;
  };
  const rows: StepListRow[] = timed.map((step, index) => {
    const counts = countsBetweenOf(countMarks, step.start, step.end);
    return {
      stepId: step.stepId,
      number: index + 1,
      name: shownStepNameOf(step.name, index + 1),
      meta: stepListRowMetaOf(
        clockOf(step.start),
        counts > 0 ? eightsTextOf(counts) : secondsLengthOf(step.end - step.start),
      ),
      poster: posterAt(step.start + (step.end - step.start) / 2),
      formation: hasFormationOf(paths, step)
        ? {
            before: pointsOf(formationAt(paths, step.start), screen),
            after: pointsOf(formationAt(paths, step.end), screen),
          }
        : null,
      selected: step.stepId === currentId && partId === null,
      press: () => {
        confirm.disarm();
        choosePart(null);
        practice.jumpTo(step.stepId);
      },
    };
  });
  const numberOf = (stepId: number): number =>
    timed.findIndex((step) => step.stepId === stepId) + 1;
  const partEntries = moves.ranges.map((range): [number, StepListPart] => {
    const first = numberOf(range.firstStepId);
    const last = numberOf(range.lastStepId);
    return [
      range.partId,
      {
        range,
        meta: stepListPartMetaOf(first, last, last - first + 1),
        selected: range.partId === partId,
        press: () => {
          confirm.disarm();
          choosePart((current) => (current === range.partId ? null : range.partId));
        },
      },
    ];
  });

  return {
    groups: stepGroupsOf(rows, moves.ranges),
    parts: new Map(partEntries),
  };
};
