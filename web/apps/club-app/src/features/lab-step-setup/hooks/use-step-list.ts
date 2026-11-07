import type { StagePoint } from '@furria/studio/choreography-motion';
import { countsBetweenOf } from '@furria/studio/count-marks';
import { clockOf } from '@furria/studio/desk-copy';
import type { ViewShare } from '@furria/studio/practice-stage';
import { viewShareOf } from '@furria/studio/practice-stage';
import { shownStepNameOf } from '@furria/studio/step-names';
import { formationAt } from '@furria/studio/studio-formation';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { markSecondsOf } from '@furria/studio/studio-steps';
import { clipSpanOf } from '@furria/studio/studio-videos';
import { useDeskBorders } from '@furria/studio/use-desk-borders';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  EJ_LONGER,
  EJ_LONGER_LABEL,
  EJ_SHORTER,
  EJ_SHORTER_LABEL,
  eightsTextOf,
} from '@/features/lab-edit-jobs/edit-jobs-copy';
import type { EjAction, EjField } from '@/features/lab-edit-jobs/edit-jobs-view';
import { ejActionOf } from '@/features/lab-edit-jobs/edit-jobs-view';
import type { EjConfirm } from '@/features/lab-edit-jobs/hooks/use-ej-confirm';
import {
  SL_ADD,
  SL_ADD_LABEL,
  SL_DELETE,
  SL_LOOP,
  SL_MERGE,
  SL_NAME,
  SL_PART_LOOP,
  SL_SPLIT,
  SL_SPLIT_LABEL,
  SS_OPEN_TEXT,
  SS_PART_DISSOLVE,
  SS_PART_NAME,
  SS_RESUME,
  SS_START_SETUP,
  SS_SURE,
  secondsLengthOf,
  slPartMetaOf,
  slRowMetaOf,
} from '../setup-copy';
import type { TimedStep } from '../setup-progress';
import { hasFormationOf, setupProgressOf, setupResumeOf } from '../setup-progress';
import type { PartRange, StepGroup } from '../step-list';
import { splitSecondsOf, stepGroupsOf } from '../step-list';
import { usePartMoves } from './use-part-moves';
import { usePartName } from './use-part-name';

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

export interface StepListDetail {
  stepId: number;
  fields: EjField[];
  tools: EjAction[];
  partTools: EjAction[];
  partLocked: boolean;
  danger: EjAction;
}

export interface StepListPart {
  range: PartRange;
  meta: string;
  selected: boolean;
  press: () => void;
}

export interface StepListPartDetail {
  partId: number;
  field: EjField;
  tools: EjAction[];
}

export interface StepListSetup {
  text: string;
  action: EjAction;
}

export interface StepList {
  groups: StepGroup<StepListRow>[];
  parts: ReadonlyMap<number, StepListPart>;
  detail: StepListDetail | null;
  partDetail: StepListPartDetail | null;
  add: EjAction;
  setup: StepListSetup;
  editable: boolean;
}

const pointsOf = (points: ReadonlyMap<number, StagePoint>, screen: StudioScreen): ViewShare[] =>
  [...points.values()].map((point) => viewShareOf(point, screen.playback.stage));

export const useStepList = (screen: StudioScreen, actId: number, confirm: EjConfirm): StepList => {
  const navigate = useNavigate();
  const { playback, practice, studio, evening } = screen;
  const work = screen.document;
  const { steps, paths, countMarks, player, length } = playback;
  const moves = usePartMoves(screen);
  const borders = useDeskBorders(screen);
  const [partId, setPartId] = useState<number | null>(null);
  const partName = usePartName(moves, partId);
  const timed: TimedStep[] = steps.flatMap((step) =>
    step.startSeconds === null || step.endSeconds === null
      ? []
      : [{ stepId: step.stepId, name: step.name, start: step.startSeconds, end: step.endSeconds }],
  );
  const currentId = practice.step?.stepId ?? null;
  const editable = evening === null;
  const placed = studio.videos.filter((video) => video.state === 'ready');
  const posterAt = (seconds: number): string | null => {
    const video = placed.find((candidate) => {
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
      meta: slRowMetaOf(
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
        setPartId(null);
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
        meta: slPartMetaOf(first, last, last - first + 1),
        selected: range.partId === partId,
        press: () => {
          confirm.disarm();
          setPartId((current) => (current === range.partId ? null : range.partId));
        },
      },
    ];
  });

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
          label: SL_NAME,
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
        ejActionOf(
          'loop',
          SL_LOOP,
          'loop',
          () => {
            practice.loopStep(step.stepId);
          },
          { pressed: practice.loopKind === 'step' },
        ),
        ejActionOf('shorter', EJ_SHORTER, 'shorter', stretch(-1), {
          label: EJ_SHORTER_LABEL,
          disabled: !stretchable,
        }),
        ejActionOf('longer', EJ_LONGER, 'longer', stretch(1), {
          label: EJ_LONGER_LABEL,
          disabled: !stretchable,
        }),
        ejActionOf(
          'split',
          SL_SPLIT,
          'mark',
          () => {
            if (split !== null) {
              work.mark(split, length);
            }
          },
          { label: SL_SPLIT_LABEL, disabled: split === null },
        ),
        ejActionOf(
          'merge',
          SL_MERGE,
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
      danger: ejActionOf(
        'delete',
        confirm.armed(deleteKey) ? SS_SURE : SL_DELETE,
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
  const allSteps = setupProgressOf(timed);
  const resume = setupResumeOf(
    allSteps,
    studio.videos.some((video) => video.placement === 'onTimeline'),
  );
  const openSetup = (): void => {
    void navigate({ to: '/lab/step-setup/$actId', params: { actId: String(actId) } });
  };

  return {
    groups: stepGroupsOf(rows, moves.ranges),
    parts: new Map(partEntries),
    detail: current === null || partId !== null || !editable ? null : detailOf(current),
    partDetail:
      shownPart === null
        ? null
        : {
            partId: shownPart.partId,
            field: {
              key: 'partName',
              label: SS_PART_NAME,
              value: partName.value,
              placeholder: partName.placeholder,
              change: partName.change,
              commit: partName.commit,
            },
            tools: [
              ejActionOf('loopPart', SL_PART_LOOP, 'loop', () => {
                practice.loopPart(shownPart.firstStepId);
              }),
              ...(editable
                ? [
                    ejActionOf(
                      'dissolve',
                      confirm.armed(dissolveKey) ? SS_SURE : SS_PART_DISSOLVE,
                      'dissolve',
                      () => {
                        confirm.press(dissolveKey, () => {
                          setPartId(null);
                          work.change({ kind: 'partRemove', partId: shownPart.partId });
                        });
                      },
                      { tone: 'danger' },
                    ),
                  ]
                : []),
            ],
          },
    add: ejActionOf(
      'add',
      SL_ADD,
      'add',
      () => {
        work.mark(markSecondsOf(playback, player.position()), length);
      },
      { label: SL_ADD_LABEL, disabled: length <= 0 || !editable },
    ),
    setup: {
      text: SS_OPEN_TEXT[resume.open](resume.count, resume.total),
      action: ejActionOf(
        'setup',
        resume.open === 'nothing' ? SS_START_SETUP : SS_RESUME,
        'steps',
        openSetup,
        { tone: resume.open === 'nothing' ? 'quiet' : 'accent' },
      ),
    },
    editable,
  };
};
