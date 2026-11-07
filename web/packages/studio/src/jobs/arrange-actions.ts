import {
  JOB_MIRROR,
  JOB_ROW_ACROSS,
  JOB_ROW_ACROSS_LABEL,
  JOB_ROW_DEEP,
  JOB_ROW_DEEP_LABEL,
  JOB_SELECT_ALL,
  JOB_SELECT_ALL_LABEL,
} from '@furria/studio/job-copy';
import type { ArrangeTool } from '@furria/studio/job-model';
import { allPickedOf } from '@furria/studio/job-model';
import type { JobAction, JobSection } from '@furria/studio/job-view';
import { jobActionOf } from '@furria/studio/job-view';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { JobArrange } from '@furria/studio/use-arrange';

export const arrangeActionOf = (
  tool: ArrangeTool,
  editor: ActStudioStage,
  arrange: JobArrange,
): JobAction => {
  switch (tool) {
    case 'mirror':
      return jobActionOf('mirror', JOB_MIRROR, 'mirror', editor.mirror);
    case 'rowAcross':
      return jobActionOf(
        'rowAcross',
        JOB_ROW_ACROSS,
        'alignDeep',
        () => {
          arrange.row('across');
        },
        { label: JOB_ROW_ACROSS_LABEL },
      );
    case 'rowDeep':
      return jobActionOf(
        'rowDeep',
        JOB_ROW_DEEP,
        'alignAcross',
        () => {
          arrange.row('deep');
        },
        { label: JOB_ROW_DEEP_LABEL },
      );
  }
};

export const selectAllActionOf = (arrange: JobArrange): JobAction =>
  jobActionOf('selectAll', JOB_SELECT_ALL, 'selectAll', arrange.selectAll, {
    label: JOB_SELECT_ALL_LABEL,
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
