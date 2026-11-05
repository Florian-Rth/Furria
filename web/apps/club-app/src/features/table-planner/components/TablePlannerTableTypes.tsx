import { KkButton } from '@furria/ui/KkButton';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkIcon } from '@furria/ui/KkIcon';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeatingSettings } from '../hooks/use-seating-settings';
import { NEW_TYPE_LABEL, TYPES_SECTION_TITLE } from '../table-planner-copy';
import { TablePlannerTableTypeForm } from './TablePlannerTableTypeForm';
import { TablePlannerTableTypeRow } from './TablePlannerTableTypeRow';

interface TablePlannerTableTypesProps {
  settings: SeatingSettings;
}

export const TablePlannerTableTypes: FC<TablePlannerTableTypesProps> = ({ settings }) => {
  const { editing } = settings;
  const rows = settings.types.map((type) =>
    editing?.mode === 'edit' && editing.tableTypeId === type.tableTypeId ? (
      <TablePlannerTableTypeForm key={type.tableTypeId} settings={settings} />
    ) : (
      <TablePlannerTableTypeRow key={type.tableTypeId} type={type} settings={settings} />
    ),
  );
  const creating =
    editing?.mode === 'new' ? (
      <TablePlannerTableTypeForm settings={settings} />
    ) : (
      <KkButton
        variant="outlined"
        onClick={settings.startNew}
        startIcon={<KkIcon name="add" size="small" />}
      >
        {NEW_TYPE_LABEL}
      </KkButton>
    );

  return (
    <KkFormSection title={TYPES_SECTION_TITLE}>
      <Stack sx={{ rowGap: 1.5 }}>
        <Stack>{rows}</Stack>
        {creating}
      </Stack>
    </KkFormSection>
  );
};
