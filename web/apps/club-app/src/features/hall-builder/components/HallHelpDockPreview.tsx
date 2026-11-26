import { KkPlanDock } from '@furria/ui/KkPlanDock';
import type { FC } from 'react';
import { ADD_LABEL, DOCK_LABEL, TOUCH_TOOL_LABELS } from '../hall-builder-copy';
import { HALL_TOOL_ICONS } from '../hall-builder-tools';

const keep = (): void => {};

export const HallHelpDockPreview: FC = () => (
  <KkPlanDock label={DOCK_LABEL}>
    <KkPlanDock.Button
      id="help-select"
      label={TOUCH_TOOL_LABELS.select}
      icon={HALL_TOOL_ICONS.select}
      pressed
      onClick={keep}
    />
    <KkPlanDock.Button id="help-add" label={ADD_LABEL} icon="add" onClick={keep} />
    <KkPlanDock.Button
      id="help-measure"
      label={TOUCH_TOOL_LABELS.measure}
      icon={HALL_TOOL_ICONS.measure}
      onClick={keep}
    />
  </KkPlanDock>
);
