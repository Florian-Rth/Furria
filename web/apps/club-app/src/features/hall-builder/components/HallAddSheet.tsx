import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import type { KkPlanChoice } from '@furria/ui/KkPlanChoiceGrid';
import { KkPlanChoiceGrid } from '@furria/ui/KkPlanChoiceGrid';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import { ADD_LABEL, ADD_SHEET_CLOSE_LABEL, TOUCH_TOOL_LABELS } from '../hall-builder-copy';
import type { HallTool } from '../hall-builder-tools';
import { HALL_TOOL_ICONS, isHallTool } from '../hall-builder-tools';

const ADDABLE_TOOLS: readonly HallTool[] = ['wall', 'door', 'area', 'pillar', 'line', 'text'];

const CHOICES: readonly KkPlanChoice[] = ADDABLE_TOOLS.map((tool) => ({
  id: tool,
  label: TOUCH_TOOL_LABELS[tool],
  icon: HALL_TOOL_ICONS[tool],
}));

export const HallAddSheet: FC = () => {
  const builder = useHallBuilderContext();
  const open = builder.isTouch && builder.isAddSheetOpen;
  const pick = (id: string): void => {
    if (isHallTool(id)) {
      builder.pickTool(id);
    }
  };

  return (
    <KkBottomDrawer
      open={open}
      label={ADD_LABEL}
      closeLabel={ADD_SHEET_CLOSE_LABEL}
      onClose={builder.closeAddSheet}
    >
      <Box sx={{ px: 2, pb: 2 }}>
        <KkPlanChoiceGrid
          label={ADD_LABEL}
          choices={CHOICES}
          value={builder.tool}
          onSelect={pick}
        />
      </Box>
    </KkBottomDrawer>
  );
};
