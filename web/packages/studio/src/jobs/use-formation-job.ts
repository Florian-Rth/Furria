import { arrangeActionOf, selectAllSectionsOf } from '@furria/studio/arrange-actions';
import {
  copyLabelOf,
  copyTextOf,
  formationContextOf,
  formationMetaOf,
  formationTitleOf,
  JOB_BLOCK,
  JOB_CIRCLE,
  JOB_FORMATION_OWNER,
  JOB_FORMATION_START,
  JOB_FORMATION_START_CONTEXT,
  JOB_GROUP_COPY,
  JOB_GROUP_ORDER,
  JOB_GROUP_PRESET,
  JOB_GROUP_SHOW,
  JOB_LINE,
  JOB_NO_SPOTS,
  JOB_ONION,
  JOB_PICK_LINE,
  JOB_ROW_NEEDS_TWO,
} from '@furria/studio/job-copy';
import { arrangeToolsOf, formationScopeOf } from '@furria/studio/job-model';
import type { JobSection, JobView } from '@furria/studio/job-view';
import { actionsIn, jobActionOf } from '@furria/studio/job-view';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { JobArrange } from '@furria/studio/use-arrange';

const BAR_KEYS: readonly string[] = ['line', 'circle', 'block', 'selectAll'];
const PICKED_BAR_KEYS: readonly string[] = ['mirror', 'rowAcross', 'rowDeep', 'selectAll'];

export const useFormationJob = (
  screen: StudioScreen,
  editor: ActStudioStage,
  arrange: JobArrange,
): JobView => {
  const { playback, practice, studio } = screen;
  const { steps } = playback;
  const step = practice.step;
  const stepIndex = steps.findIndex((candidate) => candidate.stepId === step?.stepId);
  const chosen = editor.selected.length;
  const scope = formationScopeOf(chosen, studio.spots.length);
  const noSpots = studio.spots.length === 0;
  const preset =
    (kind: 'line' | 'circle' | 'block'): (() => void) =>
    () => {
      editor.preset(kind);
    };
  const tools = arrangeToolsOf(chosen).map((tool) => arrangeActionOf(tool, editor, arrange));
  const orderSection: JobSection[] =
    tools.length === 0
      ? []
      : [
          { kind: 'tools', key: 'order', title: JOB_GROUP_ORDER, aside: null, actions: tools },
          ...(chosen === 1
            ? [{ kind: 'note' as const, key: 'rows', text: JOB_ROW_NEEDS_TWO }]
            : []),
        ];
  const source = arrange.copySource;
  const scopeText = formationMetaOf(scope.kind, scope.count, arrange.placed);
  const copySection: JobSection[] =
    source === null
      ? []
      : [
          {
            kind: 'copy',
            key: 'copy',
            title: JOB_GROUP_COPY,
            pick: {
              previousLocked: !arrange.canShift(-1),
              nextLocked: !arrange.canShift(1),
              previous: () => {
                arrange.shift(-1);
              },
              next: () => {
                arrange.shift(1);
              },
              action: jobActionOf('copy', copyTextOf(source + 1), 'copy', arrange.copy, {
                label: copyLabelOf(source + 1, scopeText),
                tone: 'accent',
              }),
            },
          },
        ];
  const sections: JobSection[] = [
    {
      kind: 'tools',
      key: 'preset',
      title: JOB_GROUP_PRESET,
      aside: null,
      actions: [
        jobActionOf('line', JOB_LINE, 'line', preset('line')),
        jobActionOf('circle', JOB_CIRCLE, 'circle', preset('circle')),
        jobActionOf('block', JOB_BLOCK, 'block', preset('block')),
      ],
    },
    ...orderSection,
    ...copySection,
    {
      kind: 'switch',
      key: 'onion',
      title: JOB_GROUP_SHOW,
      label: JOB_ONION,
      checked: editor.onion,
      change: editor.toggleOnion,
    },
  ];
  const selection = selectAllSectionsOf(chosen, arrange, JOB_PICK_LINE.formation);
  const view: JobView = {
    context:
      step === null
        ? JOB_FORMATION_START_CONTEXT
        : formationContextOf(stepIndex + 1, scope.kind, scope.count),
    blocks: [
      {
        key: 'formation',
        owner: JOB_FORMATION_OWNER,
        title: step === null ? JOB_FORMATION_START : formationTitleOf(stepIndex + 1, step.name),
        meta: scopeText,
        sections: noSpots
          ? [{ kind: 'note', key: 'noSpots', text: JOB_NO_SPOTS }]
          : [...selection, ...sections],
        danger: null,
      },
    ],
    bar: [],
  };

  return { ...view, bar: actionsIn(view, chosen === 0 ? BAR_KEYS : PICKED_BAR_KEYS) };
};
