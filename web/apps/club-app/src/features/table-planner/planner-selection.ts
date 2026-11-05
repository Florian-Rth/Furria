import type { TablePlanDocument, TableRow } from '@/features/hall-plan/schemas';
import type { ChairRef } from '@/features/hall-plan/table-layout';
import { findRow, selectionFor } from '@/features/hall-plan/table-plan-ops';

export type PlannerSelection =
  | { kind: 'none' }
  | { kind: 'rows'; rowIds: readonly string[] }
  | { kind: 'chair'; chair: ChairRef };

export type InspectorTarget =
  | { kind: 'plan' }
  | { kind: 'row'; row: TableRow }
  | { kind: 'group'; groupId: string; rowIds: readonly string[] }
  | { kind: 'rows'; rowIds: readonly string[] }
  | { kind: 'chair'; chair: ChairRef; row: TableRow };

export interface RowPress {
  selection: PlannerSelection;
  drillOnRelease: string | null;
}

export const NO_SELECTION: PlannerSelection = { kind: 'none' };

export const rowsSelection = (rowIds: readonly string[]): PlannerSelection =>
  rowIds.length === 0 ? NO_SELECTION : { kind: 'rows', rowIds };

export const selectedRowIdsOf = (selection: PlannerSelection): readonly string[] =>
  selection.kind === 'rows' ? selection.rowIds : [];

const sameSet = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((id) => right.includes(id));

export const pruneSelection = (
  document: TablePlanDocument,
  selection: PlannerSelection,
): PlannerSelection => {
  switch (selection.kind) {
    case 'none':
      return selection;
    case 'chair':
      return findRow(document, selection.chair.rowId) === null ? NO_SELECTION : selection;
    case 'rows': {
      const kept = selection.rowIds.filter((id) => findRow(document, id) !== null);

      return kept.length === selection.rowIds.length ? selection : rowsSelection(kept);
    }
  }
};

export const pressRow = (
  document: TablePlanDocument,
  selection: PlannerSelection,
  rowId: string,
  additive: boolean,
): RowPress => {
  const current = selectedRowIdsOf(selection);
  const unit = selectionFor(document, rowId);

  if (additive) {
    const allIn = unit.every((id) => current.includes(id));
    const next = allIn
      ? current.filter((id) => !unit.includes(id))
      : [...current, ...unit.filter((id) => !current.includes(id))];

    return { selection: rowsSelection(next), drillOnRelease: null };
  }
  if (current.includes(rowId)) {
    const drills = unit.length > 1 && sameSet(current, unit);

    return { selection, drillOnRelease: drills ? rowId : null };
  }

  return { selection: rowsSelection(unit), drillOnRelease: null };
};

const groupOfAll = (document: TablePlanDocument, rowIds: readonly string[]): string | null => {
  const rows = rowIds.flatMap((id) => {
    const row = findRow(document, id);

    return row === null ? [] : [row];
  });
  const groupId = rows[0]?.groupId ?? null;
  if (groupId === null || rows.some((row) => row.groupId !== groupId)) {
    return null;
  }
  const members = document.rows.filter((row) => row.groupId === groupId).map((row) => row.id);

  return sameSet(members, rowIds) ? groupId : null;
};

export const inspectorTargetOf = (
  document: TablePlanDocument,
  selection: PlannerSelection,
): InspectorTarget => {
  switch (selection.kind) {
    case 'none':
      return { kind: 'plan' };
    case 'chair': {
      const row = findRow(document, selection.chair.rowId);

      return row === null ? { kind: 'plan' } : { kind: 'chair', chair: selection.chair, row };
    }
    case 'rows': {
      const groupId = groupOfAll(document, selection.rowIds);
      if (groupId !== null && selection.rowIds.length > 1) {
        return { kind: 'group', groupId, rowIds: selection.rowIds };
      }
      const single = selection.rowIds.length === 1 ? selection.rowIds[0] : undefined;
      const row = single === undefined ? null : findRow(document, single);
      if (row !== null) {
        return { kind: 'row', row };
      }

      return selection.rowIds.length === 0
        ? { kind: 'plan' }
        : { kind: 'rows', rowIds: selection.rowIds };
    }
  }
};

export const isChairSelected = (selection: PlannerSelection, chair: ChairRef): boolean =>
  selection.kind === 'chair' &&
  selection.chair.rowId === chair.rowId &&
  selection.chair.side === chair.side &&
  selection.chair.index === chair.index;
