import { KkFloorPlan } from '@furria/ui/KkFloorPlan';
import type { FC } from 'react';
import { useTablePlannerContext } from '../table-planner-context';
import { toDragReadout } from '../table-planner-copy';

export const TablePlannerDrawReadout: FC = () => {
  const planner = useTablePlannerContext();
  const draw = planner.pointer.overlay.draw;
  const counts = planner.ghostCounts;

  if (draw === null || counts === null) {
    return null;
  }

  return (
    <KkFloorPlan.Guide
      from={draw.from}
      to={draw.to}
      label={toDragReadout(counts.tables, counts.chairs)}
    />
  );
};
