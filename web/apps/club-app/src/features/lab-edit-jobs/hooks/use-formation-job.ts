import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { arrangeActionOf, selectAllSectionsOf } from '../arrange-actions';
import { arrangeToolsOf, formationScopeOf } from '../edit-jobs';
import {
  copyLabelOf,
  copyTextOf,
  EJ_BLOCK,
  EJ_CIRCLE,
  EJ_FORMATION_OWNER,
  EJ_FORMATION_START,
  EJ_FORMATION_START_CONTEXT,
  EJ_GROUP_COPY,
  EJ_GROUP_ORDER,
  EJ_GROUP_PRESET,
  EJ_GROUP_SHOW,
  EJ_LINE,
  EJ_NO_SPOTS,
  EJ_ONION,
  EJ_PICK_LINE,
  EJ_ROW_NEEDS_TWO,
  formationContextOf,
  formationMetaOf,
  formationTitleOf,
} from '../edit-jobs-copy';
import type { EjJobView, EjSection } from '../edit-jobs-view';
import { actionsIn, ejActionOf } from '../edit-jobs-view';
import type { EjArrange } from './use-arrange';

const BAR_KEYS: readonly string[] = ['line', 'circle', 'block', 'selectAll'];
const PICKED_BAR_KEYS: readonly string[] = ['mirror', 'rowAcross', 'rowDeep', 'selectAll'];

export const useFormationJob = (
  screen: StudioScreen,
  editor: ActStudioStage,
  arrange: EjArrange,
): EjJobView => {
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
  const orderSection: EjSection[] =
    tools.length === 0
      ? []
      : [
          { kind: 'tools', key: 'order', title: EJ_GROUP_ORDER, aside: null, actions: tools },
          ...(chosen === 1 ? [{ kind: 'note' as const, key: 'rows', text: EJ_ROW_NEEDS_TWO }] : []),
        ];
  const source = arrange.copySource;
  const scopeText = formationMetaOf(scope.kind, scope.count, arrange.placed);
  const copySection: EjSection[] =
    source === null
      ? []
      : [
          {
            kind: 'copy',
            key: 'copy',
            title: EJ_GROUP_COPY,
            pick: {
              previousLocked: !arrange.canShift(-1),
              nextLocked: !arrange.canShift(1),
              previous: () => {
                arrange.shift(-1);
              },
              next: () => {
                arrange.shift(1);
              },
              action: ejActionOf('copy', copyTextOf(source + 1), 'copy', arrange.copy, {
                label: copyLabelOf(source + 1, scopeText),
                tone: 'accent',
              }),
            },
          },
        ];
  const sections: EjSection[] = [
    {
      kind: 'tools',
      key: 'preset',
      title: EJ_GROUP_PRESET,
      aside: null,
      actions: [
        ejActionOf('line', EJ_LINE, 'line', preset('line')),
        ejActionOf('circle', EJ_CIRCLE, 'circle', preset('circle')),
        ejActionOf('block', EJ_BLOCK, 'block', preset('block')),
      ],
    },
    ...orderSection,
    ...copySection,
    {
      kind: 'switch',
      key: 'onion',
      title: EJ_GROUP_SHOW,
      label: EJ_ONION,
      checked: editor.onion,
      change: editor.toggleOnion,
    },
  ];
  const selection = selectAllSectionsOf(chosen, arrange, EJ_PICK_LINE.formation);
  const view: EjJobView = {
    context:
      step === null
        ? EJ_FORMATION_START_CONTEXT
        : formationContextOf(stepIndex + 1, scope.kind, scope.count),
    blocks: [
      {
        key: 'formation',
        owner: EJ_FORMATION_OWNER,
        title: step === null ? EJ_FORMATION_START : formationTitleOf(stepIndex + 1, step.name),
        meta: scopeText,
        sections: noSpots
          ? [{ kind: 'note', key: 'noSpots', text: EJ_NO_SPOTS }]
          : [...selection, ...sections],
        danger: null,
      },
    ],
    bar: [],
  };

  return { ...view, bar: actionsIn(view, chosen === 0 ? BAR_KEYS : PICKED_BAR_KEYS) };
};
