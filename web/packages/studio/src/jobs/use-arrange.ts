import type { StagePoint, TimedKeyframe } from '@furria/studio/choreography-motion';
import { copyShiftOf, copySourceOf } from '@furria/studio/edit-jobs';
import { rowPointsOf } from '@furria/studio/stage-writes';
import type { TimeSpan } from '@furria/studio/studio-edits';
import type { ArrangeAxis } from '@furria/studio/studio-formation';
import { formationAt, formationPlacedOf } from '@furria/studio/studio-formation';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { StudioTracks } from '@furria/studio/use-track-commit';
import { useTrackCommit } from '@furria/studio/use-track-commit';
import { useState } from 'react';

export interface JobArrange {
  row: (axis: ArrangeAxis) => void;
  selectAll: () => void;
  placed: number;
  copySource: number | null;
  canShift: (direction: -1 | 1) => boolean;
  shift: (direction: -1 | 1) => void;
  copy: () => void;
}

export const useArrange = (screen: StudioScreen, editor: ActStudioStage): JobArrange => {
  const { playback, practice, studio } = screen;
  const { paths, steps, length, stage } = playback;
  const writes = useTrackCommit(screen);
  const step = practice.step;
  const current = steps.findIndex((candidate) => candidate.stepId === step?.stepId);
  const [pick, setPick] = useState<number | null>(null);
  const [pickStep, setPickStep] = useState<number | undefined>(step?.stepId);
  if (pickStep !== step?.stepId) {
    setPickStep(step?.stepId);
    setPick(null);
  }
  const copySource = copySourceOf(pick, current, steps.length);
  const span: TimeSpan = { start: editor.formationSeconds, end: step?.endSeconds ?? length };
  const formation = formationAt(paths, editor.formationSeconds);
  const keyframesOf = (spotId: number): readonly TimedKeyframe[] =>
    paths.find((path) => path.spotId === spotId)?.keyframes ?? [];
  const settle = (moves: ReadonlyMap<number, StagePoint>): void => {
    const tracks: StudioTracks = {};
    for (const [spotId, point] of moves) {
      tracks[spotId] = formationPlacedOf(spotId, keyframesOf(spotId), span, point);
    }
    writes.commit(tracks);
  };
  const byNumber = [...studio.spots]
    .sort((left, right) => left.number - right.number)
    .map((spot) => spot.spotId);
  const targets = editor.selected.length > 0 ? editor.selected : byNumber;
  const placedIds = byNumber.filter((spotId) => formation.has(spotId));

  return {
    row: (axis) => {
      const chosen = editor.selected.filter((spotId) => formation.has(spotId));
      const points = rowPointsOf(
        chosen.map((spotId) => formation.get(spotId) ?? { rightMetres: 0, backMetres: 0 }),
        axis,
        stage,
      );
      settle(
        new Map(
          chosen.map((spotId, index) => [
            spotId,
            points[index] ?? { rightMetres: 0, backMetres: 0 },
          ]),
        ),
      );
    },
    selectAll: () => {
      for (const spotId of placedIds) {
        editor.hold(spotId);
      }
    },
    placed: placedIds.length,
    copySource,
    canShift: (direction) =>
      copySource !== null && copyShiftOf(copySource, direction, current, steps.length) !== null,
    shift: (direction) => {
      if (copySource === null) {
        return;
      }
      setPick(copyShiftOf(copySource, direction, current, steps.length) ?? copySource);
    },
    copy: () => {
      const source = copySource === null ? null : (steps[copySource]?.startSeconds ?? null);
      if (source === null) {
        return;
      }
      const from = formationAt(paths, source);
      settle(
        new Map(
          targets.flatMap((spotId) => {
            const point = from.get(spotId);

            return point === undefined ? [] : [[spotId, point] as const];
          }),
        ),
      );
    },
  };
};
