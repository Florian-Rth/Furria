import type { TableRow } from '@/features/hall-plan/schemas';
import type { ChairRef } from '@/features/hall-plan/table-plan-ops';
import type { PlannerAction } from '../planner-actions';
import { useTablePlannerContext } from '../table-planner-context';
import {
  REMOVE_CHAIR_LABEL,
  RESTORE_CHAIR_LABEL,
  toChairLabel,
  toRowLabel,
} from '../table-planner-copy';

export interface ChairPanel {
  key: string;
  title: string;
  number: string | null;
  note: string | null;
  removed: boolean;
  actions: PlannerAction[];
  changeNumber: (text: string) => void;
  changeNote: (text: string) => void;
}

export const useChairPanel = (chair: ChairRef, row: TableRow): ChairPanel => {
  const { commands } = useTablePlannerContext();
  const override =
    row.chairs.find(
      (candidate) => candidate.side === chair.side && candidate.index === chair.index,
    ) ?? null;
  const removed = override?.removed ?? false;
  const toggle: PlannerAction = removed
    ? {
        id: 'restore',
        label: RESTORE_CHAIR_LABEL,
        icon: 'undo',
        onClick: () => {
          commands.patchChair(chair, { removed: false }, 'removed');
        },
      }
    : {
        id: 'remove',
        label: REMOVE_CHAIR_LABEL,
        icon: 'delete',
        tone: 'danger',
        onClick: () => {
          commands.patchChair(chair, { removed: true }, 'removed');
        },
      };

  return {
    key: `${chair.rowId}:${chair.side}:${chair.index}`,
    title: toChairLabel(override?.number ?? null, toRowLabel(row.number, row.count)),
    number: override?.number ?? null,
    note: override?.note ?? null,
    removed,
    actions: [toggle],
    changeNumber: (text) => {
      commands.patchChair(chair, { number: text }, 'number');
    },
    changeNote: (text) => {
      commands.patchChair(chair, { note: text }, 'note');
    },
  };
};
