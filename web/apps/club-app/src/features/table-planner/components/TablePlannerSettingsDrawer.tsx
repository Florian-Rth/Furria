import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useSeatingSettings } from '../hooks/use-seating-settings';
import { SETTINGS_CLOSE, SETTINGS_TITLE } from '../table-planner-copy';
import { TablePlannerStandardForm } from './TablePlannerStandardForm';
import { TablePlannerTableTypes } from './TablePlannerTableTypes';

export const TablePlannerSettingsDrawer: FC = () => {
  const settings = useSeatingSettings();

  return (
    <KkBottomDrawer
      open={settings.open}
      label={SETTINGS_TITLE}
      closeLabel={SETTINGS_CLOSE}
      onClose={settings.close}
    >
      <Box sx={{ px: 2, pb: 2, overflowY: 'auto' }}>
        <Stack sx={{ rowGap: 3, width: '100%' }}>
          <TablePlannerStandardForm settings={settings} />
          <TablePlannerTableTypes settings={settings} />
        </Stack>
      </Box>
    </KkBottomDrawer>
  );
};
