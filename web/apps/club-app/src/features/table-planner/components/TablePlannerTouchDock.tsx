import { KkPlanDock } from '@furria/ui/KkPlanDock';
import type { FC } from 'react';
import { placesTables, TOOL_ICONS } from '../planner-tools';
import { useTablePlannerContext } from '../table-planner-context';
import { ADD_LABEL, DOCK_LABEL, TOUCH_TOOL_LABELS, VIEW_LABELS } from '../table-planner-copy';

export const TablePlannerTouchDock: FC = () => {
  const planner = useTablePlannerContext();
  const isSetup = planner.view === 'setup';
  const select = (): void => {
    planner.setTool('select');
  };
  const measure = (): void => {
    planner.setTool('measure');
  };
  const toggleView = (): void => {
    planner.setView(isSetup ? 'plan' : 'setup');
  };

  return (
    <KkPlanDock label={DOCK_LABEL}>
      <KkPlanDock.Button
        id="select"
        label={TOUCH_TOOL_LABELS.select}
        icon={TOOL_ICONS.select}
        pressed={planner.tool === 'select'}
        onClick={select}
      />
      <KkPlanDock.Button
        id="add"
        label={ADD_LABEL}
        icon="add"
        pressed={placesTables(planner.tool)}
        onClick={planner.openAddSheet}
      />
      <KkPlanDock.Button
        id="measure"
        label={TOUCH_TOOL_LABELS.measure}
        icon={TOOL_ICONS.measure}
        pressed={planner.tool === 'measure'}
        onClick={measure}
      />
      <KkPlanDock.Button
        id="setup"
        label={VIEW_LABELS.setup}
        icon="chair"
        pressed={isSetup}
        onClick={toggleView}
      />
    </KkPlanDock>
  );
};
