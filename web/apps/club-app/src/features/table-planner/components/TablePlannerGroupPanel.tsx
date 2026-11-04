import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkMeta } from '@furria/ui/KkMeta';
import type { FC } from 'react';
import { useGroupPanel } from '../hooks/use-group-panel';
import { TablePlannerActions } from './TablePlannerActions';
import { TablePlannerRotateField } from './TablePlannerRotateField';
import { TablePlannerTextFields } from './TablePlannerTextFields';

interface TablePlannerGroupPanelProps {
  groupId: string | null;
  rowIds: readonly string[];
}

export const TablePlannerGroupPanel: FC<TablePlannerGroupPanelProps> = ({ groupId, rowIds }) => {
  const panel = useGroupPanel(groupId, rowIds);
  const fields =
    groupId === null ? null : (
      <TablePlannerTextFields
        key={groupId}
        number={panel.number}
        note={panel.note}
        onNumber={panel.changeNumber}
        onNote={panel.changeNote}
      />
    );

  return (
    <KkFormSection title={panel.title}>
      <KkMeta tone="muted">{panel.facts}</KkMeta>
      <TablePlannerRotateField rotation={null} onRotate={panel.rotate} />
      {fields}
      <TablePlannerActions actions={panel.actions} />
    </KkFormSection>
  );
};
