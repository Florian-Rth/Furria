import { KkPlanDock } from '@furria/ui/KkPlanDock';
import type { FC } from 'react';
import { TOOL_ICONS } from '../planner-tools';
import { ADD_LABEL, DOCK_LABEL, TOUCH_TOOL_LABELS, VIEW_LABELS } from '../table-planner-copy';

const keep = (): void => {};

export const TablePlanHelpDockPreview: FC = () => (
  <KkPlanDock label={DOCK_LABEL}>
    <KkPlanDock.Button
      id="help-select"
      label={TOUCH_TOOL_LABELS.select}
      icon={TOOL_ICONS.select}
      pressed
      onClick={keep}
    />
    <KkPlanDock.Button id="help-add" label={ADD_LABEL} icon="add" onClick={keep} />
    <KkPlanDock.Button
      id="help-measure"
      label={TOUCH_TOOL_LABELS.measure}
      icon={TOOL_ICONS.measure}
      onClick={keep}
    />
    <KkPlanDock.Button id="help-setup" label={VIEW_LABELS.setup} icon="chair" onClick={keep} />
  </KkPlanDock>
);
