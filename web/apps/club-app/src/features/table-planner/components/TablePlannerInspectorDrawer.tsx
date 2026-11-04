import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { useTablePlannerContext } from '../table-planner-context';
import { INSPECTOR_CLOSE, INSPECTOR_LABEL } from '../table-planner-copy';
import { TablePlannerInspector } from './TablePlannerInspector';

export const TablePlannerInspectorDrawer: FC = () => {
  const planner = useTablePlannerContext();
  const open = !planner.isDesk && planner.drawer === 'inspector';
  const close = (): void => {
    planner.openDrawer(null);
  };

  return (
    <KkBottomDrawer
      open={open}
      label={INSPECTOR_LABEL}
      closeLabel={INSPECTOR_CLOSE}
      onClose={close}
    >
      <Box sx={{ px: 2, pb: 2, overflowY: 'auto' }}>
        <TablePlannerInspector />
      </Box>
    </KkBottomDrawer>
  );
};
