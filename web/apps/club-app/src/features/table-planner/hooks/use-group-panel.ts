import type { PlannerAction } from '../planner-actions';
import { countsOfRows } from '../planner-facts';
import { useTablePlannerContext } from '../table-planner-context';
import {
  DELETE_LABEL,
  DUPLICATE_LABEL,
  GROUP_LABEL,
  toGroupLabel,
  toRowFacts,
  toRowsLabel,
  UNGROUP_LABEL,
} from '../table-planner-copy';

export interface GroupPanel {
  title: string;
  facts: string;
  number: string | null;
  note: string | null;
  actions: PlannerAction[];
  rotate: (degrees: number) => void;
  changeNumber: (text: string) => void;
  changeNote: (text: string) => void;
}

export const useGroupPanel = (groupId: string | null, rowIds: readonly string[]): GroupPanel => {
  const planner = useTablePlannerContext();
  const { commands } = planner;
  const group =
    planner.editor.document.groups.find((candidate) => candidate.id === groupId) ?? null;
  const counts = countsOfRows(planner.layouts, rowIds);
  const grouping: PlannerAction =
    group === null
      ? { id: 'group', label: GROUP_LABEL, icon: 'groupTables', onClick: commands.group }
      : { id: 'ungroup', label: UNGROUP_LABEL, icon: 'ungroup', onClick: commands.ungroup };

  return {
    title: group === null ? toRowsLabel(rowIds.length) : toGroupLabel(group.number),
    facts: toRowFacts(counts.tables, counts.chairs),
    number: group?.number ?? null,
    note: group?.note ?? null,
    actions: [
      grouping,
      { id: 'duplicate', label: DUPLICATE_LABEL, icon: 'copy', onClick: commands.duplicate },
      {
        id: 'delete',
        label: DELETE_LABEL,
        icon: 'delete',
        tone: 'danger',
        onClick: commands.remove,
      },
    ],
    rotate: commands.rotate,
    changeNumber: (text) => {
      if (groupId !== null) {
        commands.patchGroup(groupId, { number: text }, 'number');
      }
    },
    changeNote: (text) => {
      if (groupId !== null) {
        commands.patchGroup(groupId, { note: text }, 'note');
      }
    },
  };
};
