import type { KkPlanTool, KkPlanToolAction } from '@furria/ui/KkPlanToolRail';
import { KkPlanToolRail } from '@furria/ui/KkPlanToolRail';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import {
  FIT_LABEL,
  HALL_TOOLS_LABEL,
  REDO_LABEL,
  TOOL_LABELS,
  UNDO_LABEL,
} from '../hall-builder-copy';
import { HALL_TOOL_ICONS, HALL_TOOLS } from '../hall-builder-tools';

const TOOLS: readonly KkPlanTool[] = HALL_TOOLS.map((tool) => ({
  id: tool,
  label: TOOL_LABELS[tool],
  icon: HALL_TOOL_ICONS[tool],
}));

export const HallBuilderRail: FC = () => {
  const builder = useHallBuilderContext();
  const actions: readonly KkPlanToolAction[] = [
    {
      id: 'undo',
      label: UNDO_LABEL,
      icon: 'undo',
      disabled: !builder.canUndo,
      onClick: builder.undo,
    },
    {
      id: 'redo',
      label: REDO_LABEL,
      icon: 'redo',
      disabled: !builder.canRedo,
      onClick: builder.redo,
    },
    { id: 'fit', label: FIT_LABEL, icon: 'fit', onClick: builder.fit },
  ];
  const orientation = builder.isPhone ? 'horizontal' : 'vertical';

  return (
    <KkPlanToolRail
      label={HALL_TOOLS_LABEL}
      orientation={orientation}
      tools={TOOLS}
      value={builder.tool}
      onChange={builder.chooseTool}
      actions={actions}
    />
  );
};
