import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkButton } from '@furria/ui/KkButton';
import { KkNote } from '@furria/ui/KkNote';
import type { KkPlanChoice } from '@furria/ui/KkPlanChoiceGrid';
import { KkPlanChoiceGrid } from '@furria/ui/KkPlanChoiceGrid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PlannerTool } from '../planner-tools';
import { isPlannerTool, TOOL_ICONS } from '../planner-tools';
import { useTablePlannerContext } from '../table-planner-context';
import {
  ADD_CLOSE,
  ADD_LABEL,
  SEATS_CONTINUE_LABEL,
  TOUCH_SEATS_HINT,
  TOUCH_TOOL_HINTS,
  TOUCH_TOOL_LABELS,
} from '../table-planner-copy';
import { TablePlannerPalette } from './TablePlannerPalette';
import { TablePlannerSeatRequest } from './TablePlannerSeatRequest';

const ADDING_TOOLS: readonly PlannerTool[] = ['table', 'row', 'seats'];

const CHOICES: readonly KkPlanChoice[] = ADDING_TOOLS.map((tool) => ({
  id: tool,
  label: TOUCH_TOOL_LABELS[tool],
  icon: TOOL_ICONS[tool],
  hint: TOUCH_TOOL_HINTS[tool],
}));

export const TablePlannerAddSheet: FC = () => {
  const planner = useTablePlannerContext();
  const open = planner.isTouch && planner.isAddSheetOpen;
  const pick = (id: string): void => {
    if (isPlannerTool(id)) {
      planner.pickTool(id);
    }
  };
  const seatRequest =
    planner.tool === 'seats' ? (
      <Stack sx={{ gap: 1.5 }}>
        <TablePlannerSeatRequest />
        <KkNote tone="muted">{TOUCH_SEATS_HINT}</KkNote>
        <KkButton onClick={planner.closeAddSheet}>{SEATS_CONTINUE_LABEL}</KkButton>
      </Stack>
    ) : null;

  return (
    <KkBottomDrawer
      open={open}
      label={ADD_LABEL}
      closeLabel={ADD_CLOSE}
      onClose={planner.closeAddSheet}
    >
      <Stack sx={{ gap: 2, px: 2, pb: 2, overflowY: 'auto' }}>
        <TablePlannerPalette />
        <KkPlanChoiceGrid
          label={ADD_LABEL}
          choices={CHOICES}
          value={planner.tool}
          onSelect={pick}
        />
        {seatRequest}
      </Stack>
    </KkBottomDrawer>
  );
};
