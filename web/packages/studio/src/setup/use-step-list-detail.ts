import {
  JOB_LONGER,
  JOB_LONGER_LABEL,
  JOB_SHORTER,
  JOB_SHORTER_LABEL,
} from '@furria/studio/job-copy';
import type { JobAction, JobField } from '@furria/studio/job-view';
import { jobActionOf } from '@furria/studio/job-view';
import type { TimedStep } from '@furria/studio/setup-progress';
import { splitSecondsOf } from '@furria/studio/step-list';
import { shownStepNameOf } from '@furria/studio/step-names';
import {
  SETUP_PART_DISSOLVE,
  SETUP_PART_NAME,
  SETUP_SURE,
  STEP_LIST_DELETE,
  STEP_LIST_LOOP,
  STEP_LIST_MERGE,
  STEP_LIST_NAME,
  STEP_LIST_PART_LOOP,
  STEP_LIST_SPLIT,
  STEP_LIST_SPLIT_LABEL,
} from '@furria/studio/step-setup-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { useDeskBorders } from '@furria/studio/use-desk-borders';
import type { JobConfirm } from '@furria/studio/use-job-confirm';
import type { PartMoves } from '@furria/studio/use-part-moves';
import { usePartName } from '@furria/studio/use-part-name';
import type { Dispatch, SetStateAction } from 'react';

export interface StepListDetail {
  stepId: number;
  fields: JobField[];
  tools: JobAction[];
  partTools: JobAction[];
  partLocked: boolean;
  danger: JobAction;
}

export interface StepListPartDetail {
  partId: number;
  field: JobField;
  tools: JobAction[];
}

export interface StepListDetails {
  detail: StepListDetail | null;
  partDetail: StepListPartDetail | null;
}

export const useStepListDetail = (
  screen: StudioScreen,
  timed: readonly TimedStep[],
  moves: PartMoves,
  partId: number | null,
  choosePart: Dispatch<SetStateAction<number | null>>,
  confirm: JobConfirm,
  editable: boolean,
): StepListDetails => {
  const { playback, practice } = screen;
  const work = screen.document;
  const { countMarks, player, length } = playback;
  const borders = useDeskBorders(screen);
  const partName = usePartName(moves, partId);
  const currentId = practice.step?.stepId ?? null;
  const current = timed.find((step) => step.stepId === currentId) ?? null;
  const detailOf = (step: TimedStep): StepListDetail => {
    const at = timed.indexOf(step);
    const next = timed[at + 1];
    const write = (name: string): void => {
      work.change({ kind: 'stepName', stepId: step.stepId, name });
    };
    const split = splitSecondsOf(step, countMarks, player.position());
    const own = moves.of(step.stepId);
    const deleteKey = `step:${step.stepId}`;
    const stretchable = borders.canStretch(step.stepId);
    const stretch =
      (direction: -1 | 1): (() => void) =>
      () => {
        borders.stretch(step.stepId, direction);
      };

    return {
      stepId: step.stepId,
      fields: [
        {
          key: 'name',
          label: STEP_LIST_NAME,
          value: step.name,
          placeholder: shownStepNameOf('', at + 1),
          change: (value) => {
            write(value);
          },
          commit: () => {
            write(step.name.trim());
          },
        },
      ],
      tools: [
        jobActionOf(
          'loop',
          STEP_LIST_LOOP,
          'loop',
          () => {
            practice.loopStep(step.stepId);
          },
          { pressed: practice.loopKind === 'step' },
        ),
        jobActionOf('shorter', JOB_SHORTER, 'shorter', stretch(-1), {
          label: JOB_SHORTER_LABEL,
          disabled: !stretchable,
        }),
        jobActionOf('longer', JOB_LONGER, 'longer', stretch(1), {
          label: JOB_LONGER_LABEL,
          disabled: !stretchable,
        }),
        jobActionOf(
          'split',
          STEP_LIST_SPLIT,
          'mark',
          () => {
            if (split !== null) {
              work.mark(split, length);
            }
          },
          { label: STEP_LIST_SPLIT_LABEL, disabled: split === null },
        ),
        jobActionOf(
          'merge',
          STEP_LIST_MERGE,
          'shorter',
          () => {
            if (next !== undefined) {
              work.change({ kind: 'stepRemove', stepId: next.stepId });
            }
          },
          { disabled: next === undefined },
        ),
      ],
      partTools: own.actions,
      partLocked: own.lock !== null,
      danger: jobActionOf(
        'delete',
        confirm.armed(deleteKey) ? SETUP_SURE : STEP_LIST_DELETE,
        'delete',
        () => {
          confirm.press(deleteKey, () => {
            work.change({ kind: 'stepRemove', stepId: step.stepId });
          });
        },
        { tone: 'danger' },
      ),
    };
  };
  const shownPart = moves.ranges.find((range) => range.partId === partId) ?? null;
  const dissolveKey = `part:${partId}`;

  return {
    detail: current === null || partId !== null || !editable ? null : detailOf(current),
    partDetail:
      shownPart === null
        ? null
        : {
            partId: shownPart.partId,
            field: {
              key: 'partName',
              label: SETUP_PART_NAME,
              value: partName.value,
              placeholder: partName.placeholder,
              change: partName.change,
              commit: partName.commit,
            },
            tools: [
              jobActionOf('loopPart', STEP_LIST_PART_LOOP, 'loop', () => {
                practice.loopPart(shownPart.firstStepId);
              }),
              ...(editable
                ? [
                    jobActionOf(
                      'dissolve',
                      confirm.armed(dissolveKey) ? SETUP_SURE : SETUP_PART_DISSOLVE,
                      'dissolve',
                      () => {
                        confirm.press(dissolveKey, () => {
                          choosePart(null);
                          work.change({ kind: 'partRemove', partId: shownPart.partId });
                        });
                      },
                      { tone: 'danger' },
                    ),
                  ]
                : []),
            ],
          },
  };
};
