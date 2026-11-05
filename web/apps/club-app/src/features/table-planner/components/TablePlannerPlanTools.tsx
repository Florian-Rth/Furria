import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useTablePlannerContext } from '../table-planner-context';
import { NUMBERING_LABEL, SETTINGS_LABEL } from '../table-planner-copy';

const NUMBER_ICON = <KkIcon name="list" size="small" />;
const SETTINGS_ICON = <KkIcon name="settings" size="small" />;

export const TablePlannerPlanTools: FC = () => {
  const planner = useTablePlannerContext();
  const openSettings = (): void => {
    planner.openDrawer('settings');
  };

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
      <KkButton
        variant="outlined"
        size="small"
        startIcon={NUMBER_ICON}
        onClick={planner.commands.number}
      >
        {NUMBERING_LABEL}
      </KkButton>
      <KkButton variant="outlined" size="small" startIcon={SETTINGS_ICON} onClick={openSettings}>
        {SETTINGS_LABEL}
      </KkButton>
    </Stack>
  );
};
