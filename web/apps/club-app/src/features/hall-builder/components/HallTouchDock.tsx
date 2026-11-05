import { KkPlanDock } from '@furria/ui/KkPlanDock';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import { ADD_LABEL, DOCK_LABEL, TOUCH_TOOL_LABELS } from '../hall-builder-copy';
import { HALL_TOOL_ICONS } from '../hall-builder-tools';

export const HallTouchDock: FC = () => {
  const builder = useHallBuilderContext();
  const isAdding = builder.tool !== 'select' && builder.tool !== 'measure';
  const select = (): void => {
    builder.chooseTool('select');
  };
  const measure = (): void => {
    builder.chooseTool('measure');
  };

  return (
    <KkPlanDock label={DOCK_LABEL}>
      <KkPlanDock.Button
        id="select"
        label={TOUCH_TOOL_LABELS.select}
        icon={HALL_TOOL_ICONS.select}
        pressed={builder.tool === 'select'}
        onClick={select}
      />
      <KkPlanDock.Button
        id="add"
        label={ADD_LABEL}
        icon="add"
        pressed={isAdding}
        onClick={builder.openAddSheet}
      />
      <KkPlanDock.Button
        id="measure"
        label={TOUCH_TOOL_LABELS.measure}
        icon={HALL_TOOL_ICONS.measure}
        pressed={builder.tool === 'measure'}
        onClick={measure}
      />
    </KkPlanDock>
  );
};
