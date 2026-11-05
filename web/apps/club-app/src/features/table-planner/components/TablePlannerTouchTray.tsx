import { KkPlanStatusStrip } from '@furria/ui/KkPlanStatusStrip';
import { KkPlanTouch } from '@furria/ui/KkPlanTouch';
import type { FC } from 'react';
import { TOOL_ICONS } from '../planner-tools';
import { useTablePlannerContext } from '../table-planner-context';
import {
  MEASURE_CLEAR_LABEL,
  PLACE_SEATS_LABEL,
  TOOL_DONE_LABEL,
  TOOL_TRAY_LABEL,
  TOUCH_TOOL_LABELS,
  toDragReadout,
} from '../table-planner-copy';

export const TablePlannerTouchTray: FC = () => {
  const planner = useTablePlannerContext();
  const { tool } = planner;

  if (tool === 'select') {
    return null;
  }

  const typeName =
    tool === 'measure' || planner.paletteType === null ? null : planner.paletteType.name;
  const toolLabel =
    typeName === null ? TOUCH_TOOL_LABELS[tool] : `${TOUCH_TOOL_LABELS[tool]} · ${typeName}`;
  const measureChip =
    tool === 'measure' && planner.pointer.overlay.measure !== null ? (
      <KkPlanStatusStrip.Chip
        label={MEASURE_CLEAR_LABEL}
        icon="close"
        onClick={planner.pointer.clearMeasure}
      />
    ) : null;
  const counts = planner.ghostCounts;
  const seatChips =
    tool === 'seats' && counts !== null ? (
      <>
        <KkPlanStatusStrip.Chip label={toDragReadout(counts.tables, counts.chairs)} icon="chair" />
        <KkPlanStatusStrip.Chip
          label={PLACE_SEATS_LABEL}
          icon="check"
          tone="done"
          onClick={planner.placeSeatsHere}
        />
      </>
    ) : null;

  return (
    <KkPlanTouch.Tray>
      <KkPlanStatusStrip label={TOOL_TRAY_LABEL}>
        <KkPlanStatusStrip.Chip label={toolLabel} icon={TOOL_ICONS[tool]} pressed />
        {measureChip}
        {seatChips}
        <KkPlanStatusStrip.Chip label={TOOL_DONE_LABEL} icon="close" onClick={planner.finishTool} />
      </KkPlanStatusStrip>
    </KkPlanTouch.Tray>
  );
};
