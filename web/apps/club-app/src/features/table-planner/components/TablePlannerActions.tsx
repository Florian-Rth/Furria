import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PlannerAction } from '../planner-actions';

interface TablePlannerActionsProps {
  actions: readonly PlannerAction[];
}

export const TablePlannerActions: FC<TablePlannerActionsProps> = ({ actions }) => {
  const buttons = actions.map((action) => (
    <KkButton
      key={action.id}
      size="small"
      variant="outlined"
      tone={action.tone}
      onClick={action.onClick}
      startIcon={<KkIcon name={action.icon} size="small" />}
    >
      {action.label}
    </KkButton>
  ));

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
      {buttons}
    </Stack>
  );
};
