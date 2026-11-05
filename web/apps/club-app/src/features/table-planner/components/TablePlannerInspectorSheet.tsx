import { KkIconButton } from '@furria/ui/KkIconButton';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useTablePlannerContext } from '../table-planner-context';
import { INSPECTOR_CLOSE } from '../table-planner-copy';
import { TablePlannerInspector } from './TablePlannerInspector';

export const TablePlannerInspectorSheet: FC = () => {
  const planner = useTablePlannerContext();
  const close = (): void => {
    planner.openDrawer(null);
  };

  return (
    <Stack sx={{ gap: 1, pb: 2 }}>
      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <KkIconButton label={INSPECTOR_CLOSE} icon="close" onClick={close} />
      </Stack>
      <TablePlannerInspector />
    </Stack>
  );
};
