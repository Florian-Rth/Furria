import type { SideRef } from '@/features/hall-plan/plan-clearance';
import type {
  Point,
  RectSide,
  Seating,
  SeatingStandard,
  TablePlanDocument,
  TableType,
} from '@/features/hall-plan/schemas';
import type { RowLayout } from '@/features/hall-plan/table-layout';
import type { ChairPatch, ChairRef, NotePatch } from '@/features/hall-plan/table-plan-ops';
import {
  changeRowCount,
  clearSides,
  duplicateRows,
  expandToGroups,
  findRow,
  groupRows,
  moveRows,
  numberPlan,
  patchChair,
  patchGroup,
  patchRow,
  removeRows,
  rotateRows,
  setPlanSeating,
  setRowCount,
  setRowSeating,
  setRowSide,
  setRowType,
  ungroup,
} from '@/features/hall-plan/table-plan-ops';
import type { PlannerSelection } from '../planner-selection';
import { NO_SELECTION, rowsSelection, selectedRowIdsOf } from '../planner-selection';
import type { PlanEditor } from './use-plan-editor';

export interface PlannerCommands {
  remove: () => void;
  duplicate: () => void;
  group: () => void;
  ungroup: () => void;
  rotate: (degrees: number) => void;
  nudge: (delta: Point) => void;
  changeCount: (delta: number) => void;
  setCount: (rowId: string, count: number) => void;
  setType: (rowId: string, tableTypeId: number) => void;
  setSide: (rowId: string, side: RectSide, seated: boolean) => void;
  clearSides: (sides: readonly SideRef[]) => void;
  setPlanSeating: (seating: Seating) => void;
  setRowSeating: (rowId: string, seating: Seating | null) => void;
  patchRow: (rowId: string, patch: NotePatch, field: string) => void;
  patchGroup: (groupId: string, patch: NotePatch, field: string) => void;
  patchChair: (chair: ChairRef, patch: ChairPatch, field: string) => void;
  number: () => void;
  selectAll: () => void;
  selectRow: (rowId: string) => void;
}

interface CommandsInput {
  editor: PlanEditor;
  layouts: readonly RowLayout[];
  types: ReadonlyMap<number, TableType>;
  standard: SeatingStandard;
  selection: PlannerSelection;
  select: (selection: PlannerSelection) => void;
}

const NUDGE_KEY = 'nudge';
const ROTATE_KEY = 'rotate';

export const usePlannerCommands = ({
  editor,
  layouts,
  types,
  standard,
  selection,
  select,
}: CommandsInput): PlannerCommands => {
  const document = editor.document;
  const selected = selectedRowIdsOf(selection);
  const apply = (next: TablePlanDocument, key: string | null = null): void => {
    editor.apply(next, key);
  };
  const typeOfRow = (rowId: string): TableType | null => {
    const row = findRow(document, rowId);

    return row === null ? null : (types.get(row.tableTypeId) ?? null);
  };
  const singleRow = (): string | null => (selected.length === 1 ? (selected[0] ?? null) : null);

  return {
    remove: () => {
      if (selection.kind === 'chair') {
        apply(patchChair(document, selection.chair, { removed: true }));

        return;
      }
      if (selected.length > 0) {
        apply(removeRows(document, selected));
        select(NO_SELECTION);
      }
    },
    duplicate: () => {
      if (selected.length === 0) {
        return;
      }
      const copy = duplicateRows(document, selected);
      apply(copy.document);
      select(rowsSelection(copy.ids));
    },
    group: () => {
      if (selected.length < 2) {
        return;
      }
      const grouping = groupRows(document, selected);
      apply(grouping.document);
    },
    ungroup: () => {
      const groups = new Set(
        selected.flatMap((rowId) => {
          const groupId = findRow(document, rowId)?.groupId ?? null;

          return groupId === null ? [] : [groupId];
        }),
      );
      apply([...groups].reduce((next, groupId) => ungroup(next, groupId), document));
    },
    rotate: (degrees) => {
      if (selected.length > 0) {
        apply(rotateRows(document, selected, degrees), ROTATE_KEY);
      }
    },
    nudge: (delta) => {
      if (selected.length > 0) {
        apply(moveRows(document, selected, delta), NUDGE_KEY);
      }
    },
    changeCount: (delta) => {
      const rowId = singleRow();
      const type = rowId === null ? null : typeOfRow(rowId);
      if (rowId !== null && type !== null) {
        apply(changeRowCount(document, rowId, delta, type, standard));
      }
    },
    setCount: (rowId, count) => {
      const type = typeOfRow(rowId);
      if (type !== null) {
        apply(setRowCount(document, rowId, count, type, standard), `count:${rowId}`);
      }
    },
    setType: (rowId, tableTypeId) => {
      apply(setRowType(document, rowId, tableTypeId));
    },
    setSide: (rowId, side, seated) => {
      apply(setRowSide(document, rowId, side, seated));
    },
    clearSides: (sides) => {
      apply(clearSides(document, sides));
    },
    setPlanSeating: (seating) => {
      apply(setPlanSeating(document, seating));
    },
    setRowSeating: (rowId, seating) => {
      apply(setRowSeating(document, rowId, seating));
    },
    patchRow: (rowId, patch, field) => {
      apply(patchRow(document, rowId, patch), `row:${rowId}:${field}`);
    },
    patchGroup: (groupId, patch, field) => {
      apply(patchGroup(document, groupId, patch), `group:${groupId}:${field}`);
    },
    patchChair: (chair, patch, field) => {
      apply(
        patchChair(document, chair, patch),
        `chair:${chair.rowId}:${chair.side}:${chair.index}:${field}`,
      );
    },
    number: () => {
      apply(numberPlan(document, layouts));
    },
    selectAll: () => {
      select(rowsSelection(document.rows.map((row) => row.id)));
    },
    selectRow: (rowId) => {
      select(rowsSelection(expandToGroups(document, [rowId])));
    },
  };
};
