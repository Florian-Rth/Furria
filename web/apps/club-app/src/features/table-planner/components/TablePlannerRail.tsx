import type { KkPlanTool, KkPlanToolAction } from '@furria/ui/KkPlanToolRail';
import { KkPlanToolRail } from '@furria/ui/KkPlanToolRail';
import type { FC } from 'react';
import { isPlannerTool, PLANNER_TOOLS, TOOL_ICONS } from '../planner-tools';
import { useTablePlannerContext } from '../table-planner-context';
import { FIT_LABEL, RAIL_LABEL, REDO_LABEL, TOOL_LABELS, UNDO_LABEL } from '../table-planner-copy';

const TOOLS: readonly KkPlanTool[] = PLANNER_TOOLS.map((tool) => ({
  id: tool,
  label: TOOL_LABELS[tool],
  icon: TOOL_ICONS[tool],
}));

export const TablePlannerRail: FC = () => {
  const planner = useTablePlannerContext();
  const change = (id: string): void => {
    if (isPlannerTool(id)) {
      planner.setTool(id);
    }
  };
  const actions: readonly KkPlanToolAction[] = [
    {
      id: 'undo',
      label: UNDO_LABEL,
      icon: 'undo',
      disabled: !planner.editor.canUndo,
      onClick: planner.editor.undo,
    },
    {
      id: 'redo',
      label: REDO_LABEL,
      icon: 'redo',
      disabled: !planner.editor.canRedo,
      onClick: planner.editor.redo,
    },
    { id: 'fit', label: FIT_LABEL, icon: 'fit', onClick: planner.viewport.fit },
  ];

  return (
    <KkPlanToolRail
      label={RAIL_LABEL}
      orientation={planner.isDesk ? 'vertical' : 'horizontal'}
      tools={TOOLS}
      value={planner.tool}
      onChange={change}
      actions={actions}
    />
  );
};
