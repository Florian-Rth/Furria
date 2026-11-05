import type { KkSelectOption } from '@furria/ui/KkSelectField';
import type { RectSide, Seating, TableRow } from '@/features/hall-plan/schemas';
import type { PlannerAction } from '../planner-actions';
import type { SideToggle } from '../planner-facts';
import { countsOfRows, sideTogglesOf } from '../planner-facts';
import { useTablePlannerContext } from '../table-planner-context';
import {
  DELETE_LABEL,
  DUPLICATE_LABEL,
  toRowFacts,
  toRowLabel,
  UNGROUP_LABEL,
  WHOLE_GROUP_LABEL,
} from '../table-planner-copy';

export interface RowPanel {
  title: string;
  facts: string;
  typeValue: string;
  typeOptions: KkSelectOption[];
  count: string;
  isRound: boolean;
  sides: SideToggle[];
  seating: Seating | null;
  rotation: number;
  actions: PlannerAction[];
  changeType: (value: string) => void;
  changeCount: (value: string) => void;
  changeSeating: (seating: Seating | null) => void;
  changeSide: (side: RectSide, seated: boolean) => void;
  rotate: (degrees: number) => void;
  changeNumber: (text: string) => void;
  changeNote: (text: string) => void;
}

export const useRowPanel = (row: TableRow): RowPanel => {
  const planner = useTablePlannerContext();
  const { commands } = planner;
  const type = planner.types.get(row.tableTypeId) ?? null;
  const counts = countsOfRows(planner.layouts, [row.id]);
  const options = planner.tableTypes
    .filter((candidate) => !candidate.archived || candidate.tableTypeId === row.tableTypeId)
    .map((candidate) => ({ value: String(candidate.tableTypeId), label: candidate.name }));
  const grouped: PlannerAction[] =
    row.groupId === null
      ? []
      : [
          {
            id: 'ungroup',
            label: UNGROUP_LABEL,
            icon: 'ungroup',
            onClick: commands.ungroup,
          },
          {
            id: 'whole',
            label: WHOLE_GROUP_LABEL,
            icon: 'groupTables',
            onClick: () => {
              commands.selectRow(row.id);
            },
          },
        ];

  return {
    title: toRowLabel(row.number, row.count),
    facts: toRowFacts(counts.tables, counts.chairs),
    typeValue: String(row.tableTypeId),
    typeOptions: options,
    count: String(row.count),
    isRound: type?.shape === 'round',
    sides: type === null ? [] : sideTogglesOf(row, type),
    seating: row.seating,
    rotation: row.rotation,
    actions: [
      { id: 'duplicate', label: DUPLICATE_LABEL, icon: 'copy', onClick: commands.duplicate },
      ...grouped,
      {
        id: 'delete',
        label: DELETE_LABEL,
        icon: 'delete',
        tone: 'danger',
        onClick: commands.remove,
      },
    ],
    changeType: (value) => {
      commands.setType(row.id, Number(value));
    },
    changeCount: (value) => {
      const count = Number(value);
      if (Number.isInteger(count) && count > 0) {
        commands.setCount(row.id, count);
      }
    },
    changeSeating: (seating) => {
      commands.setRowSeating(row.id, seating);
    },
    changeSide: (side, seated) => {
      commands.setSide(row.id, side, seated);
    },
    rotate: commands.rotate,
    changeNumber: (text) => {
      commands.patchRow(row.id, { number: text }, 'number');
    },
    changeNote: (text) => {
      commands.patchRow(row.id, { note: text }, 'note');
    },
  };
};
