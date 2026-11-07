import type { ArrangeTool } from '@furria/studio/edit-jobs';
import { allPickedOf } from '@furria/studio/edit-jobs';
import {
  EJ_MIRROR,
  EJ_ROW_ACROSS,
  EJ_ROW_ACROSS_LABEL,
  EJ_ROW_DEEP,
  EJ_ROW_DEEP_LABEL,
  EJ_SELECT_ALL,
  EJ_SELECT_ALL_LABEL,
} from '@furria/studio/edit-jobs-copy';
import type { JobAction, JobSection } from '@furria/studio/edit-jobs-view';
import { jobActionOf } from '@furria/studio/edit-jobs-view';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { JobArrange } from '@furria/studio/use-arrange';

export const arrangeActionOf = (
  tool: ArrangeTool,
  editor: ActStudioStage,
  arrange: JobArrange,
): JobAction => {
  switch (tool) {
    case 'mirror':
      return jobActionOf('mirror', EJ_MIRROR, 'mirror', editor.mirror);
    case 'rowAcross':
      return jobActionOf(
        'rowAcross',
        EJ_ROW_ACROSS,
        'row',
        () => {
          arrange.row('across');
        },
        { label: EJ_ROW_ACROSS_LABEL },
      );
    case 'rowDeep':
      return jobActionOf(
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

export const selectAllActionOf = (arrange: JobArrange): JobAction =>
  jobActionOf('selectAll', EJ_SELECT_ALL, 'selectAll', arrange.selectAll, {
    label: EJ_SELECT_ALL_LABEL,
  });

export const selectAllSectionsOf = (
  selected: number,
  arrange: JobArrange,
  pickLine: string,
): JobSection[] => {
  const all = allPickedOf(selected, arrange.placed);
  const note: JobSection[] =
    selected === 0 ? [{ kind: 'note', key: 'pickLine', text: pickLine }] : [];
  const tools: JobSection[] = all
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
