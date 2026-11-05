import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import type { FC } from 'react';
import { useTablePlannerContext } from '../table-planner-context';
import { PALETTE_LABEL } from '../table-planner-copy';

export const TablePlannerPalette: FC = () => {
  const planner = useTablePlannerContext();
  const choices: readonly KkChoiceChip[] = planner.activeTypes.map((type) => ({
    id: String(type.tableTypeId),
    label: type.name,
    icon: type.shape === 'round' ? 'tables' : 'row',
  }));
  const value = planner.paletteType === null ? null : String(planner.paletteType.tableTypeId);
  const change = (id: string): void => {
    planner.setPaletteType(Number(id));
  };

  return <KkChoiceChips label={PALETTE_LABEL} choices={choices} value={value} onChange={change} />;
};
