import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { ArrangeTool } from './edit-jobs';
import { allPickedOf } from './edit-jobs';
import {
  EJ_MIRROR,
  EJ_ROW_ACROSS,
  EJ_ROW_ACROSS_LABEL,
  EJ_ROW_DEEP,
  EJ_ROW_DEEP_LABEL,
  EJ_SELECT_ALL,
  EJ_SELECT_ALL_LABEL,
} from './edit-jobs-copy';
import type { EjAction, EjSection } from './edit-jobs-view';
import { ejActionOf } from './edit-jobs-view';
import type { EjArrange } from './hooks/use-arrange';

export const arrangeActionOf = (
  tool: ArrangeTool,
  editor: ActStudioStage,
  arrange: EjArrange,
): EjAction => {
  switch (tool) {
    case 'mirror':
      return ejActionOf('mirror', EJ_MIRROR, 'mirror', editor.mirror);
    case 'rowAcross':
      return ejActionOf(
        'rowAcross',
        EJ_ROW_ACROSS,
        'row',
        () => {
          arrange.row('across');
        },
        { label: EJ_ROW_ACROSS_LABEL },
      );
    case 'rowDeep':
      return ejActionOf(
        'rowDeep',
        EJ_ROW_DEEP,
        'column',
        () => {
          arrange.row('deep');
        },
        { label: EJ_ROW_DEEP_LABEL },
      );
  }
};

export const selectAllActionOf = (arrange: EjArrange): EjAction =>
  ejActionOf('selectAll', EJ_SELECT_ALL, 'selectAll', arrange.selectAll, {
    label: EJ_SELECT_ALL_LABEL,
  });

export const selectAllSectionsOf = (
  selected: number,
  arrange: EjArrange,
  pickLine: string,
): EjSection[] => {
  const all = allPickedOf(selected, arrange.placed);
  const note: EjSection[] =
    selected === 0 ? [{ kind: 'note', key: 'pickLine', text: pickLine }] : [];
  const tools: EjSection[] = all
    ? []
    : [
        {
          kind: 'tools',
          key: 'selection',
          title: null,
          aside: null,
          actions: [selectAllActionOf(arrange)],
        },
      ];

  return [...note, ...tools];
};
