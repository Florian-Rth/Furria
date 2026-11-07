import { countsBetweenOf } from '@furria/studio/count-marks';
import { partOfStep } from '@furria/studio/music-timeline';
import { stepNumberOf } from '@furria/studio/step-names';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { markSecondsOf, startsAPart } from '@furria/studio/studio-steps';
import type { ActStudioStepTool } from '@furria/studio/use-act-studio-step-tool';
import type { DeskBorders } from '@furria/studio/use-desk-borders';
import type { StepDeskPart } from '@furria/studio/use-step-desk';
import { useStepDesk } from '@furria/studio/use-step-desk';
import { useStepNaming } from '@furria/studio/use-step-naming';
import {
  EJ_EVENING_STEPS,
  EJ_FIRST_STEP,
  EJ_FIRST_STEP_LABEL,
  EJ_GROUP_LENGTH,
  EJ_GROUP_MAIN_VIDEO,
  EJ_GROUP_PART_START,
  EJ_GROUP_STEPS,
  EJ_GROUP_TEXT,
  EJ_LAST_STEP,
  EJ_LONGER,
  EJ_LONGER_LABEL,
  EJ_LOOP_PART,
  EJ_LOOP_PART_LABEL,
  EJ_MARK,
  EJ_MARK_LABEL,
  EJ_NAME,
  EJ_NEW_PART,
  EJ_NO_STEP,
  EJ_NO_STEP_HINT,
  EJ_NO_STEP_MUSIC,
  EJ_PART_DISSOLVE,
  EJ_PART_EARLIER,
  EJ_PART_LATER,
  EJ_PART_NAME,
  EJ_PART_OWNER,
  EJ_SHORTER,
  EJ_SHORTER_LABEL,
  EJ_STEP_DELETE,
  EJ_STEP_OWNER,
  EJ_SURE,
  EJ_SURE_DISSOLVE,
  partMetaOf,
  stepMetaOf,
  stepOwnerOf,
  stepTitleOf,
} from '../edit-jobs-copy';
import type { EjAction, EjBlock, EjJobView, EjSection } from '../edit-jobs-view';
import { actionsIn, ejActionOf } from '../edit-jobs-view';
import type { EjConfirm } from './use-ej-confirm';

const BAR_KEYS: readonly string[] = ['shorter', 'longer', 'mark', 'newPart'];
const EVENING_BAR_KEYS: readonly string[] = ['loopPart'];
const ignore = (): void => undefined;

export const useStepsJob = (
  screen: StudioScreen,
  borders: DeskBorders,
  confirm: EjConfirm,
): EjJobView => {
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
  const mark = ejActionOf(
    'mark',
    first ? EJ_FIRST_STEP : EJ_MARK,
    'mark',
    () => {
      work.mark(markSecondsOf(playback, player.position()), length);
    },
    { label: first ? EJ_FIRST_STEP_LABEL : EJ_MARK_LABEL, tone: first ? 'accent' : 'quiet' },
  );
  const silent = length <= 0;

  if (step === null) {
    const startSections: EjSection[] = silent
      ? []
      : [{ kind: 'tools', key: 'mark', title: null, aside: null, actions: [mark] }];
    const noStep: EjBlock = {
      key: 'none',
      owner: EJ_STEP_OWNER,
      title: EJ_NO_STEP,
      meta: silent ? EJ_NO_STEP_MUSIC : EJ_NO_STEP_HINT,
      sections: onSession
        ? startSections
        : [{ kind: 'note', key: 'evening', text: EJ_EVENING_STEPS }],
      danger: null,
    };
    const view = { context: EJ_NO_STEP, blocks: [noStep], bar: [] };

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
  const lengthTools: EjAction[] = [
    ejActionOf(
      'shorter',
      EJ_SHORTER,
      'shorter',
      () => {
        borders.stretch(step.stepId, -1);
      },
      { label: EJ_SHORTER_LABEL },
    ),
    ejActionOf(
      'longer',
      EJ_LONGER,
      'longer',
      () => {
        borders.stretch(step.stepId, 1);
      },
      { label: EJ_LONGER_LABEL },
    ),
  ];
  const newPart = ejActionOf('newPart', EJ_NEW_PART, 'part', desk?.openPart ?? ignore);
  const splitTools = startsAPart(parts, step.stepId) ? [mark] : [mark, newPart];
  const lengthSection: EjSection = canStretch
    ? { kind: 'tools', key: 'length', title: EJ_GROUP_LENGTH, aside: null, actions: lengthTools }
    : { kind: 'note', key: 'length', text: EJ_LAST_STEP };
  const sessionSections: EjSection[] = [
    {
      kind: 'fields',
      key: 'text',
      title: EJ_GROUP_TEXT,
      fields: [
        {
          key: 'name',
          label: EJ_NAME,
          value: texts.name,
          placeholder: step.name,
          change: texts.rename,
          commit: texts.commit,
        },
      ],
    },
    lengthSection,
    { kind: 'tools', key: 'steps', title: EJ_GROUP_STEPS, aside: null, actions: splitTools },
  ];
  const stepBlock: EjBlock = {
    key: `step:${step.stepId}`,
    owner: stepOwnerOf(number, steps.length),
    title: step.name,
    meta: stepMetaOf(start, end, counts),
    sections: onSession
      ? sessionSections
      : [{ kind: 'note', key: 'evening', text: EJ_EVENING_STEPS }],
    danger: onSession
      ? ejActionOf(
          'deleteStep',
          confirm.armed(deleteKey) ? EJ_SURE : EJ_STEP_DELETE,
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
  const loopPart = ejActionOf(
    'loopPart',
    EJ_LOOP_PART,
    'loop',
    () => {
      practice.loopPart(step.stepId);
    },
    { label: EJ_LOOP_PART_LABEL, pressed: loopingPart },
  );
  const loopSection: EjSection = {
    kind: 'tools',
    key: 'partPractice',
    title: null,
    aside: null,
    actions: [loopPart],
  };
  const partSectionsOf = (shown: StepDeskPart, name: string): EjSection[] => {
    const shifts = shown.leads
      ? [
          ...(shown.shiftLocked.earlier
            ? []
            : [
                ejActionOf('partEarlier', EJ_PART_EARLIER, 'earlier', () => {
                  shown.shift('earlier');
                }),
              ]),
          ...(shown.shiftLocked.later
            ? []
            : [
                ejActionOf('partLater', EJ_PART_LATER, 'later', () => {
                  shown.shift('later');
                }),
              ]),
        ]
      : [];
    const shiftSection: EjSection[] =
      shifts.length === 0
        ? []
        : [
            {
              kind: 'tools',
              key: 'partStart',
              title: EJ_GROUP_PART_START,
              aside: null,
              actions: shifts,
            },
          ];

    return [
      {
        kind: 'fields',
        key: 'partName',
        title: EJ_PART_NAME,
        fields: [
          {
            key: 'partName',
            label: EJ_PART_NAME,
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
        title: EJ_GROUP_MAIN_VIDEO,
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
  const partBlock: EjBlock | null =
    part === null || partDesk === null
      ? null
      : {
          key: `part:${part.partId}`,
          owner: EJ_PART_OWNER,
          title: part.name,
          meta: partMetaOf(
            stepNumberOf(steps, part.stepIds[0] ?? -1),
            stepNumberOf(steps, part.stepIds.at(-1) ?? -1),
            part.stepIds.length,
          ),
          sections: onSession ? partSectionsOf(partDesk, part.name) : [loopSection],
          danger: onSession
            ? ejActionOf(
                'dissolve',
                confirm.armed(`part:${part.partId}`) ? EJ_SURE_DISSOLVE : EJ_PART_DISSOLVE,
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
  const view: EjJobView = {
    context: stepTitleOf(number, step.name),
    blocks: partBlock === null ? [stepBlock] : [stepBlock, partBlock],
    bar: [],
  };

  return { ...view, bar: actionsIn(view, onSession ? BAR_KEYS : EVENING_BAR_KEYS) };
};
