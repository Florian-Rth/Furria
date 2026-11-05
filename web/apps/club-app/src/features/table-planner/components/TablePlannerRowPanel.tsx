import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkSelectField } from '@furria/ui/KkSelectField';
import type { FC } from 'react';
import type { TableRow } from '@/features/hall-plan/schemas';
import { ROW_COUNT_MAX, ROW_COUNT_MIN } from '@/features/hall-plan/schemas';
import { useRowPanel } from '../hooks/use-row-panel';
import { COUNT_FIELD_LABEL, COUNT_STEP_LABELS, TYPE_FIELD_LABEL } from '../table-planner-copy';
import { TablePlannerActions } from './TablePlannerActions';
import { TablePlannerRotateField } from './TablePlannerRotateField';
import { TablePlannerSeatingField } from './TablePlannerSeatingField';
import { TablePlannerSidesField } from './TablePlannerSidesField';
import { TablePlannerTextFields } from './TablePlannerTextFields';

interface TablePlannerRowPanelProps {
  row: TableRow;
}

export const TablePlannerRowPanel: FC<TablePlannerRowPanelProps> = ({ row }) => {
  const panel = useRowPanel(row);
  const sides = panel.isRound ? null : (
    <TablePlannerSidesField toggles={panel.sides} onChange={panel.changeSide} />
  );

  return (
    <KkFormSection title={panel.title}>
      <KkMeta tone="muted">{panel.facts}</KkMeta>
      <KkSelectField
        name="tableType"
        label={TYPE_FIELD_LABEL}
        value={panel.typeValue}
        options={panel.typeOptions}
        presentation="select"
        onChange={panel.changeType}
      />
      <KkNumberField
        name="count"
        label={COUNT_FIELD_LABEL}
        value={panel.count}
        onChange={panel.changeCount}
        stepLabels={COUNT_STEP_LABELS}
        min={ROW_COUNT_MIN}
        max={ROW_COUNT_MAX}
      />
      <TablePlannerSeatingField seating={panel.seating} onChange={panel.changeSeating} />
      {sides}
      <TablePlannerRotateField rotation={panel.rotation} onRotate={panel.rotate} />
      <TablePlannerTextFields
        key={row.id}
        number={row.number}
        note={row.note}
        onNumber={panel.changeNumber}
        onNote={panel.changeNote}
      />
      <TablePlannerActions actions={panel.actions} />
    </KkFormSection>
  );
};
