import { countsBetweenOf } from '@furria/studio/count-marks';
import {
  JOB_EVENING_STEPS,
  JOB_FIRST_STEP,
  JOB_FIRST_STEP_LABEL,
  JOB_GROUP_LENGTH,
  JOB_GROUP_MAIN_VIDEO,
  JOB_GROUP_PART_START,
  JOB_GROUP_STEPS,
  JOB_GROUP_TEXT,
  JOB_LAST_STEP,
  JOB_LONGER,
  JOB_LONGER_LABEL,
  JOB_LOOP_PART,
  JOB_LOOP_PART_LABEL,
  JOB_MARK,
  JOB_MARK_LABEL,
  JOB_NAME,
  JOB_NEW_PART,
  JOB_NO_STEP,
  JOB_NO_STEP_HINT,
  JOB_NO_STEP_MUSIC,
  JOB_PART_DISSOLVE,
  JOB_PART_EARLIER,
  JOB_PART_LATER,
  JOB_PART_NAME,
  JOB_PART_OWNER,
  JOB_SHORTER,
  JOB_SHORTER_LABEL,
  JOB_STEP_DELETE,
  JOB_STEP_OWNER,
  JOB_SURE,
  JOB_SURE_DISSOLVE,
  partMetaOf,
  stepMetaOf,
  stepOwnerOf,
  stepTitleOf,
} from '@furria/studio/job-copy';
import type { JobAction, JobBlock, JobSection, JobView } from '@furria/studio/job-view';
import { actionsIn, jobActionOf } from '@furria/studio/job-view';
import { partOfStep } from '@furria/studio/music-timeline';
import { stepNumberOf } from '@furria/studio/step-names';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { markSecondsOf, startsAPart } from '@furria/studio/studio-steps';
import type { ActStudioStepTool } from '@furria/studio/use-act-studio-step-tool';
import type { DeskBorders } from '@furria/studio/use-desk-borders';
import type { JobConfirm } from '@furria/studio/use-job-confirm';
import type { StepDeskPart } from '@furria/studio/use-step-desk';
import { useStepDesk } from '@furria/studio/use-step-desk';
import { useStepNaming } from '@furria/studio/use-step-naming';

const BAR_KEYS: readonly string[] = ['shorter', 'longer', 'mark', 'newPart'];
const EVENING_BAR_KEYS: readonly string[] = ['loopPart'];
const ignore = (): void => undefined;

export const useStepsJob = (
  screen: StudioScreen,
  borders: DeskBorders,
  confirm: JobConfirm,
): JobView => {
  const { playback, practice, evening } = screen;
  const work = screen.document;
  const { steps, parts, countMarks, length, player } = playback;
  const step = practice.step;
  const texts = useStepNaming(screen);
  const deskTool: ActStudioStepTool = {
    deskOpen: true,
    deskStepId: null,
    canMark: length > 0,
    openDesk: ignore,
    closeDesk: ignore,
    markHere: ignore,
  };
  const desk = useStepDesk(screen, deskTool);
  const onSession = evening === null;
  const first = steps.length === 0;
  const mark = jobActionOf(
    'mark',
    first ? JOB_FIRST_STEP : JOB_MARK,
    'mark',
    () => {
      work.mark(markSecondsOf(playback, player.position()), length);
    },
    { label: first ? JOB_FIRST_STEP_LABEL : JOB_MARK_LABEL, tone: first ? 'accent' : 'quiet' },
  );
  const silent = length <= 0;

  if (step === null) {
    const startSections: JobSection[] = silent
      ? []
      : [{ kind: 'tools', key: 'mark', title: null, aside: null, actions: [mark] }];
    const noStep: JobBlock = {
      key: 'none',
      owner: JOB_STEP_OWNER,
      title: JOB_NO_STEP,
      meta: silent ? JOB_NO_STEP_MUSIC : JOB_NO_STEP_HINT,
      sections: onSession
        ? startSections
        : [{ kind: 'note', key: 'evening', text: JOB_EVENING_STEPS }],
      danger: null,
    };
    const view = { context: JOB_NO_STEP, blocks: [noStep], bar: [] };

    return { ...view, bar: actionsIn(view, ['mark']) };
  }

  const number = stepNumberOf(steps, step.stepId);
  const start = step.startSeconds ?? 0;
  const end = step.endSeconds ?? 0;
  const counts = countsBetweenOf(countMarks, start, end);
  const canStretch = borders.canStretch(step.stepId);
  const part = partOfStep(parts, step.stepId);
  const loopingPart = practice.loopKind === 'part';
  const deleteKey = `step:${step.stepId}`;
  const lengthTools: JobAction[] = [
    jobActionOf(
      'shorter',
      JOB_SHORTER,
      'shorter',
      () => {
        borders.stretch(step.stepId, -1);
      },
      { label: JOB_SHORTER_LABEL },
    ),
    jobActionOf(
      'longer',
      JOB_LONGER,
      'longer',
      () => {
        borders.stretch(step.stepId, 1);
      },
      { label: JOB_LONGER_LABEL },
    ),
  ];
  const newPart = jobActionOf('newPart', JOB_NEW_PART, 'parts', desk?.openPart ?? ignore);
  const splitTools = startsAPart(parts, step.stepId) ? [mark] : [mark, newPart];
  const lengthSection: JobSection = canStretch
    ? { kind: 'tools', key: 'length', title: JOB_GROUP_LENGTH, aside: null, actions: lengthTools }
    : { kind: 'note', key: 'length', text: JOB_LAST_STEP };
  const sessionSections: JobSection[] = [
    {
      kind: 'fields',
      key: 'text',
      title: JOB_GROUP_TEXT,
      fields: [
        {
          key: 'name',
          label: JOB_NAME,
          value: texts.name,
          placeholder: step.name,
          change: texts.rename,
          commit: texts.commit,
        },
      ],
    },
    lengthSection,
    { kind: 'tools', key: 'steps', title: JOB_GROUP_STEPS, aside: null, actions: splitTools },
  ];
  const stepBlock: JobBlock = {
    key: `step:${step.stepId}`,
    owner: stepOwnerOf(number, steps.length),
    title: step.name,
    meta: stepMetaOf(start, end, counts),
    sections: onSession
      ? sessionSections
      : [{ kind: 'note', key: 'evening', text: JOB_EVENING_STEPS }],
    danger: onSession
      ? jobActionOf(
          'deleteStep',
          confirm.armed(deleteKey) ? JOB_SURE : JOB_STEP_DELETE,
          'delete',
          () => {
            confirm.press(deleteKey, () => {
              work.change({ kind: 'stepRemove', stepId: step.stepId });
            });
          },
          { tone: 'danger' },
        )
      : null,
  };

  const partDesk = desk?.part ?? null;
  const loopPart = jobActionOf(
    'loopPart',
    JOB_LOOP_PART,
    'loop',
    () => {
      practice.loopPart(step.stepId);
    },
    { label: JOB_LOOP_PART_LABEL, pressed: loopingPart },
  );
  const loopSection: JobSection = {
    kind: 'tools',
    key: 'partPractice',
    title: null,
    aside: null,
    actions: [loopPart],
  };
  const partSectionsOf = (shown: StepDeskPart, name: string): JobSection[] => {
    const shifts = shown.leads
      ? [
          ...(shown.shiftLocked.earlier
            ? []
            : [
                jobActionOf('partEarlier', JOB_PART_EARLIER, 'earlier', () => {
                  shown.shift('earlier');
                }),
              ]),
          ...(shown.shiftLocked.later
            ? []
            : [
                jobActionOf('partLater', JOB_PART_LATER, 'later', () => {
                  shown.shift('later');
                }),
              ]),
        ]
      : [];
    const shiftSection: JobSection[] =
      shifts.length === 0
        ? []
        : [
            {
              kind: 'tools',
              key: 'partStart',
              title: JOB_GROUP_PART_START,
              aside: null,
              actions: shifts,
            },
          ];

    return [
      {
        kind: 'fields',
        key: 'partName',
        title: JOB_PART_NAME,
        fields: [
          {
            key: 'partName',
            label: JOB_PART_NAME,
            value: shown.name,
            placeholder: name,
            change: shown.rename,
            commit: shown.commitName,
          },
        ],
      },
      ...shiftSection,
      {
        kind: 'choices',
        key: 'mainVideo',
        title: JOB_GROUP_MAIN_VIDEO,
        aside: null,
        choices: shown.videos.map((video) => ({
          key: video.key,
          text: video.text,
          label: undefined,
          current: video.variant === 'contained',
          disabled: false,
          reason: null,
          press: video.press,
        })),
      },
      loopSection,
    ];
  };
  const partBlock: JobBlock | null =
    part === null || partDesk === null
      ? null
      : {
          key: `part:${part.partId}`,
          owner: JOB_PART_OWNER,
          title: part.name,
          meta: partMetaOf(
            stepNumberOf(steps, part.stepIds[0] ?? -1),
            stepNumberOf(steps, part.stepIds.at(-1) ?? -1),
            part.stepIds.length,
          ),
          sections: onSession ? partSectionsOf(partDesk, part.name) : [loopSection],
          danger: onSession
            ? jobActionOf(
                'dissolve',
                confirm.armed(`part:${part.partId}`) ? JOB_SURE_DISSOLVE : JOB_PART_DISSOLVE,
                'dissolve',
                () => {
                  confirm.press(`part:${part.partId}`, () => {
                    work.change({ kind: 'partRemove', partId: part.partId });
                  });
                },
                { tone: 'danger' },
              )
            : null,
        };
  const view: JobView = {
    context: stepTitleOf(number, step.name),
    blocks: partBlock === null ? [stepBlock] : [stepBlock, partBlock],
    bar: [],
  };

  return { ...view, bar: actionsIn(view, onSession ? BAR_KEYS : EVENING_BAR_KEYS) };
};
