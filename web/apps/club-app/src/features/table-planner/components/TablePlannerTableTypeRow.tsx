import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkSelectRow } from '@furria/ui/KkSelectRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { TableType } from '@/features/hall-plan/schemas';
import type { SeatingSettings } from '../hooks/use-seating-settings';
import { TYPE_EDIT_LABEL, TYPE_REMOVE_LABEL, toTableTypeMeta } from '../table-planner-copy';

interface TablePlannerTableTypeRowProps {
  type: TableType;
  settings: SeatingSettings;
}

export const TablePlannerTableTypeRow: FC<TablePlannerTableTypeRowProps> = ({ type, settings }) => {
  const edit = (): void => {
    settings.startEdit(type);
  };
  const remove = (): void => {
    settings.removeType(type.tableTypeId);
  };
  const meta = toTableTypeMeta(type.shape, type.lengthCm, type.widthCm, type.seatsAtEnds);
  const trailing = (
    <Stack direction="row" sx={{ columnGap: 0.5 }}>
      <KkIconButton label={TYPE_EDIT_LABEL} icon="edit" onClick={edit} />
      <KkIconButton label={TYPE_REMOVE_LABEL} icon="delete" onClick={remove} />
    </Stack>
  );

  return <KkSelectRow title={type.name} meta={meta} trailing={trailing} />;
};
