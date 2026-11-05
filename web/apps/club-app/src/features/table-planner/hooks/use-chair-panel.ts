import type { TableRow } from '@/features/hall-plan/schemas';
import type { ChairRef } from '@/features/hall-plan/table-layout';
import { findChair } from '@/features/hall-plan/table-layout';
import type { ChairPatch } from '@/features/hall-plan/table-plan-ops';
import type { PlannerAction } from '../planner-actions';
import type { ChairNotice } from '../planner-facts';
import { chairNoticeOf } from '../planner-facts';
import { useTablePlannerContext } from '../table-planner-context';
import {
  KEEP_CHAIR_LABEL,
  RELEASE_CHAIR_LABEL,
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
  notice: ChairNotice;
  actions: PlannerAction[];
  changeNumber: (text: string) => void;
  changeNote: (text: string) => void;
}

export const useChairPanel = (chair: ChairRef, row: TableRow): ChairPanel => {
  const { commands, layouts } = useTablePlannerContext();
  const placed = findChair(layouts, chair);
  const override =
    row.chairs.find(
      (candidate) => candidate.side === chair.side && candidate.index === chair.index,
    ) ?? null;
  const notice = chairNoticeOf(placed?.state ?? null, placed?.kept ?? false);
  const patch = (change: ChairPatch): void => {
    commands.patchChair(chair, change, 'state');
  };
  const restore: PlannerAction = {
    id: 'restore',
    label: RESTORE_CHAIR_LABEL,
    icon: 'undo',
    onClick: () => {
      patch({ removed: false });
    },
  };
  const remove: PlannerAction = {
    id: 'remove',
    label: REMOVE_CHAIR_LABEL,
    icon: 'delete',
    tone: 'danger',
    onClick: () => {
      patch({ removed: true });
    },
  };
  const keep: PlannerAction = {
    id: 'keep',
    label: KEEP_CHAIR_LABEL,
    icon: 'chair',
    onClick: () => {
      patch({ kept: true });
    },
  };
  const release: PlannerAction = {
    id: 'release',
    label: RELEASE_CHAIR_LABEL,
    icon: 'undo',
    onClick: () => {
      patch({ kept: false });
    },
  };
  const actionsByNotice: Record<NonNullable<ChairNotice> | 'none', PlannerAction[]> = {
    removed: [restore],
    leftOut: [keep, remove],
    kept: [release, remove],
    none: [remove],
  };

  return {
    key: `${chair.rowId}:${chair.side}:${chair.index}`,
    title: toChairLabel(override?.number ?? null, toRowLabel(row.number, row.count)),
    number: override?.number ?? null,
    note: override?.note ?? null,
    notice,
    actions: actionsByNotice[notice ?? 'none'],
    changeNumber: (text) => {
      commands.patchChair(chair, { number: text }, 'number');
    },
    changeNote: (text) => {
      commands.patchChair(chair, { note: text }, 'note');
    },
  };
};
