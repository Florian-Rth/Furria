import { KkPlanStatusStrip } from '@furria/ui/KkPlanStatusStrip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { findingsToneOf } from '../planner-status';
import { placesTables } from '../planner-tools';
import { useTablePlannerContext } from '../table-planner-context';
import {
  CHAIRS_COUNT_LABEL,
  EDIT_SELECTION_LABEL,
  NUMBERING_LABEL,
  SEATING_LABELS,
  SETTINGS_LABEL,
  STATUS_LABEL,
  TABLES_COUNT_LABEL,
  toFindingsChipLabel,
  VIEW_LABELS,
} from '../table-planner-copy';
import { TablePlannerPalette } from './TablePlannerPalette';
import { TablePlannerSeatRequest } from './TablePlannerSeatRequest';

export const TablePlannerStatus: FC = () => {
  const planner = useTablePlannerContext();
  const seating = planner.editor.document.seating;
  const openFindings = (): void => {
    planner.openDrawer('findings');
  };
  const openSettings = (): void => {
    planner.openDrawer('settings');
  };
  const openInspector = (): void => {
    planner.openDrawer('inspector');
  };
  const comfortable = (): void => {
    planner.commands.setPlanSeating('comfortable');
  };
  const maximum = (): void => {
    planner.commands.setPlanSeating('maximum');
  };
  const planView = (): void => {
    planner.setView('plan');
  };
  const setupView = (): void => {
    planner.setView('setup');
  };
  const editChip =
    planner.isDesk || planner.selection.kind === 'none' ? null : (
      <KkPlanStatusStrip.Chip label={EDIT_SELECTION_LABEL} icon="edit" onClick={openInspector} />
    );
  const palette = placesTables(planner.tool) ? <TablePlannerPalette /> : null;
  const seatRequest = planner.tool === 'seats' ? <TablePlannerSeatRequest /> : null;

  return (
    <Stack sx={{ rowGap: 1 }}>
      <KkPlanStatusStrip label={STATUS_LABEL}>
        <KkPlanStatusStrip.Count value={String(planner.counts.tables)} label={TABLES_COUNT_LABEL} />
        <KkPlanStatusStrip.Count value={String(planner.counts.chairs)} label={CHAIRS_COUNT_LABEL} />
        <KkPlanStatusStrip.Chip
          label={toFindingsChipLabel(planner.tally.conflicts, planner.tally.hints)}
          tone={findingsToneOf(planner.tally)}
          icon="alert"
          onClick={openFindings}
        />
        <KkPlanStatusStrip.Chip
          label={SEATING_LABELS.comfortable}
          pressed={seating === 'comfortable'}
          onClick={comfortable}
        />
        <KkPlanStatusStrip.Chip
          label={SEATING_LABELS.maximum}
          pressed={seating === 'maximum'}
          onClick={maximum}
        />
        <KkPlanStatusStrip.Chip
          label={VIEW_LABELS.plan}
          icon="tables"
          pressed={planner.view === 'plan'}
          onClick={planView}
        />
        <KkPlanStatusStrip.Chip
          label={VIEW_LABELS.setup}
          icon="chair"
          pressed={planner.view === 'setup'}
          onClick={setupView}
        />
        <KkPlanStatusStrip.Chip
          label={NUMBERING_LABEL}
          icon="list"
          onClick={planner.commands.number}
        />
        <KkPlanStatusStrip.Chip label={SETTINGS_LABEL} icon="settings" onClick={openSettings} />
        {editChip}
      </KkPlanStatusStrip>
      {palette}
      {seatRequest}
    </Stack>
  );
};
